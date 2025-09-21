/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { BuyNowDto } from './dto/buy-now.dto';
import { OrderModel } from './model/order.model';
import { MessengeCode } from '../common/exception/MessengeCode';
import { CartsService } from '../carts/carts.service';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { IProduct, ICategory } from './interfaces/product.interface';
import { OrderStatus } from './enum/order-status.enum';
import { AffiliateService } from '../affiliate/affiliate.service';
import { AffiliateLinkService } from '../affiliate/affiliate-link.service';
import { SubscriptionTypesService } from '../subscription-types/subscription-types.service';
import { SubscriptionDurationsService } from '../subscription-durations/subscription-durations.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OrderItem.name) private orderItemModel: Model<OrderItemDocument>,
    @InjectModel('Product') private productModel: Model<IProduct>,
    @InjectModel('Category') private categoryModel: Model<ICategory>,
    private readonly cartsService: CartsService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly affiliateService: AffiliateService,
    private readonly affiliateLinkService: AffiliateLinkService,
    private readonly subscriptionTypesService: SubscriptionTypesService,
    private readonly subscriptionDurationsService: SubscriptionDurationsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async createFromCart(userId: string, createOrderDto: CreateOrderDto): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Get cart items
      const cartItems = await this.cartsService.getUserCart(userId);
      
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new BadRequestException('Giỏ hàng trống');
      }

      // 2. Check for existing pending order
      const existingOrder = await this.orderModel
        .findOne({ 
          uid: userId.toString(),
          status: 'pending'
        })
        .session(session);

      let order;
      if (existingOrder) {
        console.log('existingOrder', existingOrder);
        // Update existing order
        // existingOrder.id_payment = new Types.ObjectId(createOrderDto.id_payment);
        existingOrder.voucher = createOrderDto.voucher;
        existingOrder.note = createOrderDto.note || 'Không có ghi chú';
        // We'll recalculate total_items after processing all items
        order = existingOrder;
      } else {
        // Create new order
        order = new this.orderModel({
          uid: userId,
          id_payment: createOrderDto.id_payment,
          voucher: createOrderDto.voucher,
          status: 'pending',
          note: createOrderDto.note || 'Không có ghi chú',
          total_items: cartItems.length,
          items: []
        });
      }

      const savedOrder = await order.save({ session });

      // 3. Process cart items and update or create order items
      const newOrderItems = [];
      const updatedOrderItems = [];
      
      // If there's an existing order, get its items to check for duplicates
      let existingOrderItems = [];
      if (existingOrder) {
        existingOrderItems = await this.orderItemModel
          .find({ id_order: existingOrder._id })
          .session(session);
      }

      for (const cartItem of cartItems) {
        const product = await this.productModel.findById(cartItem.id_product).lean() as IProduct;
        if (!product) {
          throw new BadRequestException(`Sản phẩm không tồn tại: ${cartItem.id_product}`);
        }

        const category = await this.categoryModel.findById(product.id_category).lean() as ICategory;
        
        // Check if this product already exists in the order
        const existingOrderItem = existingOrderItems.find(
          item => item.id_product.toString() === product._id.toString()
        );

        if (existingOrderItem) {
          // Update existing order item quantity
          existingOrderItem.quantity += cartItem.quantity;
          
          // Update subscription data if available
          if (cartItem.subscription_price) {
            existingOrderItem.old_price = cartItem.subscription_price;
            existingOrderItem.discount_precent = 0;
            existingOrderItem.final_price = cartItem.subscription_price;
            
            // Update subscription info in product snapshot
            if (!existingOrderItem.product_snapshot) {
              existingOrderItem.product_snapshot = {
                name: product.name,
                image: product.image,
                description: product.description,
                base_price: product.base_price,
                category_id: product.id_category,
                category_name: category?.name || 'Unknown'
              };
            }
            
            existingOrderItem.product_snapshot.subscription_info = {
              subscription_type_name: cartItem.subscription_type_name,
              subscription_duration: cartItem.subscription_duration,
              subscription_days: cartItem.subscription_days,
              subscription_price: cartItem.subscription_price
            };
          }
          
          await existingOrderItem.save({ session });
          updatedOrderItems.push(existingOrderItem);
        } else {
          // Create new order item
          // Use subscription price if available, otherwise use product price
          const itemPrice = cartItem.subscription_price || product.base_price;
          const itemDiscount = cartItem.subscription_price ? 0 : (product.discount?.discount_precent || 0);
          const finalPrice = itemPrice * (1 - itemDiscount / 100);

          const orderItem = new this.orderItemModel({
            id_order: savedOrder._id,
            id_product: product._id,
            quantity: cartItem.quantity,
            old_price: itemPrice,
            discount_precent: itemDiscount,
            final_price: finalPrice,
            product_snapshot: {
              name: product.name,
              image: product.image,
              description: product.description,
              base_price: product.base_price,
              category_id: product.id_category,
              category_name: category?.name || 'Unknown',
              // Add subscription info to product snapshot if available
              subscription_info: cartItem.subscription_type_name ? {
                subscription_type_name: cartItem.subscription_type_name,
                subscription_duration: cartItem.subscription_duration,
                subscription_days: cartItem.subscription_days,
                subscription_price: cartItem.subscription_price
              } : null
            }
          });

          const savedItem = await orderItem.save({ session });
          newOrderItems.push(savedItem);
        }
      }

      // 4. Update order with item IDs and recalculate total_items
      if (existingOrder) {
        // Only add new item IDs to the items array
        const newItemIds = newOrderItems.map(item => item._id);
        savedOrder.items = [...savedOrder.items, ...newItemIds] as any;
        
        // Recalculate total_items based on the quantities of all items
        const allOrderItems = [...updatedOrderItems, ...newOrderItems];
        savedOrder.total_items = allOrderItems.reduce((total, item) => total + item.quantity, 0);
      } else {
        savedOrder.items = newOrderItems.map(item => item._id) as any;
        savedOrder.total_items = newOrderItems.reduce((total, item) => total + item.quantity, 0);
      }
      await savedOrder.save({ session });

      // 4.1. Create subscriptions for items with subscription data
      const subscriptionsCreated = [];
      for (const cartItem of cartItems) {
        if (cartItem.subscription_type_id && cartItem.subscription_duration_id) {
          try {
            const subscriptionDto = {
              product_id: cartItem.id_product.toString(),
              subscription_type_id: cartItem.subscription_type_id.toString(),
              subscription_duration_id: cartItem.subscription_duration_id.toString(),
              notes: `Đơn hàng từ giỏ hàng: ${savedOrder._id} - ${createOrderDto.note || 'Không có ghi chú'}`
            };

            const createdSubscription = await this.subscriptionsService.create(subscriptionDto, userId);
            subscriptionsCreated.push({
              subscription_id: createdSubscription.id,
              product_id: cartItem.id_product,
              subscription_type_name: cartItem.subscription_type_name,
              subscription_duration: cartItem.subscription_duration,
              subscription_days: cartItem.subscription_days,
              subscription_price: cartItem.subscription_price
            });
            
            console.log('✅ Subscription created from cart:', createdSubscription.id);
          } catch (subscriptionError) {
            console.error('❌ Failed to create subscription from cart:', subscriptionError.message);
            // Don't fail the order if subscription creation fails
          }
        }
      }

      // 5. Commit transaction
      await session.commitTransaction();

      // 6. Return order with items
      const orderModel = OrderModel.fromEntity(savedOrder);
      
      // Combine updated and new items for the response
      const allItems = [...updatedOrderItems, ...newOrderItems];
      return {
        ...orderModel,
        items: allItems.map(item => ({
          id: item._id,
          quantity: item.quantity,
          old_price: item.old_price,
          discount_precent: item.discount_precent,
          final_price: item.final_price,
          product_snapshot: item.product_snapshot
        })),
        subscriptions: subscriptionsCreated.length > 0 ? subscriptionsCreated : null
      };

    } catch (error) {
      await session.abortTransaction();
      console.error('Error creating/updating order from cart:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Không thể tạo/cập nhật đơn hàng: ' + error.message);
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<OrderModel[]> {
    const orders = await this.orderModel
      .find()
      .populate('uid')
      .populate('id_payment')
      .populate('items')
      .exec();
    return OrderModel.fromEntities(orders);
  }
  async findSuccessOrders(userId: any): Promise<any[]> {
    const orders = await this.orderModel
      .find({ 
        uid: userId,
        status: OrderStatus.COMPLETED
      })
      .populate('id_payment')
      .populate({
        path: 'items',
        populate: {
          path: 'id_product',
          model: 'Product',
          select: 'name image description base_price discount'
        }
      })
      .lean()
      .exec();
    
    // Transform the orders to include full item details
    const transformedOrders = await Promise.all(orders.map(async (order) => {
      const orderItems = await this.orderItemModel
        .find({ id_order: order._id })
        .populate('id_product')
        .lean();

      return {
        id: order._id,
        uid: order.uid,
        note: order.note,
        voucher: order.voucher,
        status: order.status,
        total_items: order.total_items,
        items: orderItems.map(item => ({
          id: item._id,
          quantity: item.quantity,
          old_price: item.old_price,
          discount_precent: item.discount_precent,
          final_price: item.final_price,
          product_snapshot: item.product_snapshot,
          product: item.id_product
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    }));

    return transformedOrders;
  }

  async findByUser(userId: any): Promise<any[]> {
    const orders = await this.orderModel
      .find({ 
        uid: userId,
        status: { $ne: OrderStatus.COMPLETED } 
      })
      .populate('id_payment')
      .populate({
        path: 'items',
        populate: {
          path: 'id_product',
          model: 'Product',
          select: 'name image description base_price discount'
        }
      })
      .lean()
      .exec();
    
    // Transform the orders to include full item details
    const transformedOrders = await Promise.all(orders.map(async (order) => {
      const orderItems = await this.orderItemModel
        .find({ id_order: order._id })
        .populate('id_product')
        .lean();

      return {
        id: order._id,
        uid: order.uid,
        note: order.note,
        voucher: order.voucher,
        status: order.status,
        total_items: order.total_items,
        items: orderItems.map(item => ({
          id: item._id,
          quantity: item.quantity,
          old_price: item.old_price,
          discount_precent: item.discount_precent,
          final_price: item.final_price,
          product_snapshot: item.product_snapshot,
          product: item.id_product
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    }));

    return transformedOrders;
  }

  async findOne(id: string): Promise<OrderModel> {
    const order = await this.orderModel
      .findById(new Types.ObjectId(id))
      .populate('uid')
      .populate('id_payment')
      .populate('items')
      .exec();

    if (!order) {
      throw MessengeCode.ORDER.NOT_FOUND;
    }

    return OrderModel.fromEntity(order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderModel> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        {
          ...updateOrderDto,
          id_payment: updateOrderDto.id_payment ? new Types.ObjectId(updateOrderDto.id_payment) : undefined,
        },
        { new: true }
      )
      .exec();

    if (!updatedOrder) {
      throw MessengeCode.ORDER.NOT_FOUND;
    }

    return OrderModel.fromEntity(updatedOrder);
  }

  async updateStatus(id: string, status: string): Promise<OrderModel> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        new Types.ObjectId(id),
        { status },
        { new: true }
      )
      .populate('uid')
      .populate('id_payment')
      .populate('items')
      .exec();
    console.log('updatedOrder', updatedOrder);
    if (!updatedOrder) {
      throw MessengeCode.ORDER.NOT_FOUND;
    }
    console.log('updatedOrder.uid', updatedOrder.uid);
    //delete cart when order status is completed
    if (status === OrderStatus.COMPLETED) {
      await this.cartsService.clearCart(updatedOrder.uid?._id.toString());
    }

    return OrderModel.fromEntity(updatedOrder);
  }

  async remove(id: string): Promise<OrderModel> {
    const deletedOrder = await this.orderModel
      .findByIdAndDelete(new Types.ObjectId(id))
      .exec();

    if (!deletedOrder) {
      throw MessengeCode.ORDER.NOT_FOUND;
    }

    return OrderModel.fromEntity(deletedOrder);
  }

  async getOrderItems(orderId: string): Promise<any[]> {
    try {
      // Find all order items for the given order ID
      const orderItems = await this.orderItemModel.find({ id_order: new Types.ObjectId(orderId) })
        .populate({
          path: 'id_product',
          select: 'name price images description'
        })
        .exec();
      
      if (!orderItems || orderItems.length === 0) {
        return [];
      }
      
      // Transform the order items to include product details
      return orderItems.map(item => ({
        id: item._id.toString(),
        quantity: item.quantity,
        old_price: item.old_price,
        discount_precent: item.discount_precent,
        final_price: item.final_price,
        product_snapshot: item.product_snapshot || {
          name: (item.id_product as any)?.name || 'Sản phẩm',
          image: (item.id_product as any)?.images?.[0] || '',
          description: (item.id_product as any)?.description || 'Sản phẩm',
          base_price: (item.id_product as any)?.price || item.old_price,
          category_id: '',
          category_name: 'Khác'
        }
      }));
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw new Error('Không thể lấy danh sách sản phẩm trong đơn hàng');
    }
  }

  async buyNow(userId: string, buyNowDto: BuyNowDto): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Delete any existing pending orders for this user
      const existingPendingOrders = await this.orderModel
        .find({ 
          uid: userId,
          status: 'pending'
        })
        .session(session);

      if (existingPendingOrders.length > 0) {
        console.log(`🗑️ Xóa ${existingPendingOrders.length} đơn hàng cũ cho user ${userId}`);
        
        // Delete associated order items first
        for (const order of existingPendingOrders) {
          await this.orderItemModel.deleteMany({ id_order: order._id }).session(session);
        }
        
        // Then delete the orders
        await this.orderModel.deleteMany({ 
          uid: userId,
          status: 'pending'
        }).session(session);
      }

      // 2. Validate product exists
      const product = await this.productModel.findById(buyNowDto.id_product).lean() as IProduct;
      if (!product) {
        throw new BadRequestException(`Sản phẩm không tồn tại: ${buyNowDto.id_product}`);
      }

      // 3. Validate quantity
      if (buyNowDto.quantity <= 0) {
        throw new BadRequestException('Số lượng phải lớn hơn 0');
      }

      // 4. Skip inventory check - allow purchase without warehouse validation

      // 5. Get category info
      const category = await this.categoryModel.findById(product.id_category).lean() as ICategory;

      // 5.1. Validate subscription data if provided
      let subscriptionData = null;
      if (buyNowDto.subscription_type_id && buyNowDto.subscription_duration_id) {
        // Validate subscription type exists
        const subscriptionType = await this.subscriptionTypesService.findById(buyNowDto.subscription_type_id);
        if (!subscriptionType) {
          throw new BadRequestException(`Subscription type không tồn tại: ${buyNowDto.subscription_type_id}`);
        }

        // Validate subscription duration exists
        const subscriptionDuration = await this.subscriptionDurationsService.findById(buyNowDto.subscription_duration_id);
        if (!subscriptionDuration) {
          throw new BadRequestException(`Subscription duration không tồn tại: ${buyNowDto.subscription_duration_id}`);
        }

        // Validate subscription duration belongs to the subscription type
        if (subscriptionDuration.subscription_type_id.toString() !== buyNowDto.subscription_type_id) {
          throw new BadRequestException('Subscription duration không thuộc về subscription type đã chọn');
        }

        subscriptionData = {
          subscription_type_id: buyNowDto.subscription_type_id,
          subscription_duration_id: buyNowDto.subscription_duration_id,
          subscription_type_name: buyNowDto.subscription_type_name || subscriptionType.type_name,
          subscription_duration: buyNowDto.subscription_duration || subscriptionDuration.duration,
          subscription_days: buyNowDto.subscription_days || subscriptionDuration.days,
          subscription_price: buyNowDto.subscription_price || subscriptionDuration.price
        };

        console.log('📦 Subscription data validated:', subscriptionData);
      }

      // 6. Create new order
      const order = new this.orderModel({
        uid: userId,
        id_payment: buyNowDto.id_payment,
        voucher: buyNowDto.voucher,
        status: buyNowDto.status || 'pending',
        note: buyNowDto.note || 'Mua ngay',
        total_items: buyNowDto.quantity,
        items: [],
        affiliateCode: buyNowDto.affiliateCode
      });

      const savedOrder = await order.save({ session });

      // 7. Create order item
      // Use subscription price if available, otherwise use product price
      const itemPrice = subscriptionData ? subscriptionData.subscription_price : product.base_price;
      const itemDiscount = subscriptionData ? 0 : (product.discount?.discount_precent || 0);
      const finalPrice = itemPrice * (1 - itemDiscount / 100);

      const orderItem = new this.orderItemModel({
        id_order: savedOrder._id,
        id_product: product._id,
        quantity: buyNowDto.quantity,
        old_price: itemPrice,
        discount_precent: itemDiscount,
        final_price: finalPrice,
        product_snapshot: {
          name: product.name,
          image: product.image,
          description: product.description,
          base_price: product.base_price,
          category_id: product.id_category,
          category_name: category?.name || 'Unknown',
          // Add subscription info to product snapshot
          subscription_info: subscriptionData ? {
            subscription_type_name: subscriptionData.subscription_type_name,
            subscription_duration: subscriptionData.subscription_duration,
            subscription_days: subscriptionData.subscription_days,
            subscription_price: subscriptionData.subscription_price
          } : null
        }
      });

      const savedItem = await orderItem.save({ session });

      // 8. Update order with item ID
      savedOrder.items = [savedItem._id] as any;
      await savedOrder.save({ session });

      // 8.1. Create subscription if subscription data provided
      let createdSubscription = null;
      if (subscriptionData) {
        try {
          const subscriptionDto = {
            product_id: product._id.toString(),
            subscription_type_id: subscriptionData.subscription_type_id,
            subscription_duration_id: subscriptionData.subscription_duration_id,
            notes: `Đơn hàng: ${savedOrder._id} - ${buyNowDto.note || 'Mua ngay'}`
          };

          createdSubscription = await this.subscriptionsService.create(subscriptionDto, userId);
          console.log('✅ Subscription created:', createdSubscription.id);

          // Update order with subscription info
          savedOrder.subscription_id = createdSubscription.id;
          await savedOrder.save({ session });
        } catch (subscriptionError) {
          console.error('❌ Failed to create subscription:', subscriptionError.message);
          // Don't fail the order if subscription creation fails
        }
      }

      // 9. Skip inventory reduction - no warehouse management

      // 10. Handle affiliate commission if affiliate code provided
      if (buyNowDto.affiliateCode) {
        try {
          // Check if it's an affiliate link code
          try {
            await this.affiliateLinkService.trackConversion(
              buyNowDto.affiliateCode, 
              userId, 
              savedItem.final_price * buyNowDto.quantity
            );
          } catch {
            // If not a link code, try as regular affiliate code
            const commissionResult = await this.affiliateService.processCommissionAfterPayment({
              _id: savedOrder._id,
              affiliateCode: buyNowDto.affiliateCode,
              totalAmount: savedItem.final_price * buyNowDto.quantity,
              userId: userId,
              userEmail: buyNowDto.userEmail
            });
            
            if (commissionResult) {
              // Cập nhật order với commission info
              savedOrder.commissionAmount = commissionResult.commission;
              await savedOrder.save({ session });
              console.log(`✅ Commission processed for order ${savedOrder._id}: ${commissionResult.commission} VND`);
            }
          }
        } catch (affiliateError) {
          console.warn('Affiliate commission calculation failed:', affiliateError.message);
          // Don't fail the order if affiliate calculation fails
        }
      }

      // 11. Commit transaction
      await session.commitTransaction();

      // 12. Return order with item details
      const orderModel = OrderModel.fromEntity(savedOrder);
      return {
        ...orderModel,
        items: [{
          id: savedItem._id,
          quantity: savedItem.quantity,
          old_price: savedItem.old_price,
          discount_precent: savedItem.discount_precent,
          final_price: savedItem.final_price,
          product_snapshot: savedItem.product_snapshot
        }],
        subscription: createdSubscription ? {
          id: createdSubscription.id,
          subscription_type_name: subscriptionData.subscription_type_name,
          subscription_duration: subscriptionData.subscription_duration,
          subscription_days: subscriptionData.subscription_days,
          subscription_price: subscriptionData.subscription_price,
          start_date: createdSubscription.start_date,
          end_date: createdSubscription.end_date,
          status: createdSubscription.status
        } : null
      };

    } catch (error) {
      await session.abortTransaction();
      console.error('Error in buy now:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error('Không thể thực hiện mua ngay: ' + error.message);
    } finally {
      session.endSession();
    }
  }
} 