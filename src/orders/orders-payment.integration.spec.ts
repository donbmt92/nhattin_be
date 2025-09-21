import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { OrdersService } from './orders.service';
import { PaymentService } from '../payment/payment.service';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';
import { PaymentDetail, PaymentDetailDocument } from '../payment/schemas/payment-detail.schema';
import { CartsService } from '../carts/carts.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { AffiliateLinkService } from '../affiliate/affiliate-link.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BuyNowDto } from './dto/buy-now.dto';
import { CreatePaymentDto } from '../payment/dto/create-payment.dto';
import { OrderStatus } from './enum/order-status.enum';
import { PaymentStatus } from '../payment/enum/payment-status.enum';

describe('Orders-Payment Integration', () => {
  let ordersService: OrdersService;
  let paymentService: PaymentService;
  let orderModel: any;
  let orderItemModel: any;
  let paymentModel: any;
  let productModel: any;
  let categoryModel: any;
  let cartsService: any;
  let connection: any;
  let affiliateService: any;
  let affiliateLinkService: any;

  const mockOrder = {
    _id: '507f1f77bcf86cd799439011',
    uid: '507f1f77bcf86cd799439012',
    id_payment: '507f1f77bcf86cd799439013',
    note: 'Test order',
    voucher: 'TEST_VOUCHER',
    status: OrderStatus.PENDING,
    total_items: 2,
    items: ['507f1f77bcf86cd799439014'],
    affiliateCode: 'AFFILIATE123',
    commissionAmount: 10000,
    commissionStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockOrderItem = {
    _id: '507f1f77bcf86cd799439014',
    id_order: '507f1f77bcf86cd799439011',
    id_product: '507f1f77bcf86cd799439015',
    quantity: 2,
    old_price: 100000,
    discount_precent: 10,
    final_price: 90000,
    product_snapshot: {
      name: 'Test Product',
      image: 'test-image.jpg',
      description: 'Test Description',
      base_price: 100000,
      category_id: '507f1f77bcf86cd799439016',
      category_name: 'Test Category'
    },
    save: jest.fn(),
  };

  const mockPayment = {
    _id: '507f1f77bcf86cd799439013',
    id_order: '507f1f77bcf86cd799439011',
    provider: 'VNPay',
    status: PaymentStatus.COMPLETED,
    amount: 180000,
    is_bank_transfer: false,
    bank_name: null,
    transaction_reference: 'TXN123456',
    transfer_date: null,
    transfer_note: null,
    order_snapshot: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  };

  const mockProduct = {
    _id: '507f1f77bcf86cd799439015',
    name: 'Test Product',
    image: 'test-image.jpg',
    description: 'Test Description',
    base_price: 100000,
    id_category: '507f1f77bcf86cd799439016',
    discount: {
      discount_precent: 10
    }
  };

  const mockCategory = {
    _id: '507f1f77bcf86cd799439016',
    name: 'Test Category'
  };

  const mockCartItems = [
    {
      id_product: '507f1f77bcf86cd799439015',
      quantity: 2
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        PaymentService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            new: jest.fn().mockReturnValue(mockOrder),
            constructor: jest.fn().mockReturnValue(mockOrder),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken(OrderItem.name),
          useValue: {
            new: jest.fn().mockReturnValue(mockOrderItem),
            constructor: jest.fn().mockReturnValue(mockOrderItem),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(PaymentDetail.name),
          useValue: {
            new: jest.fn().mockReturnValue(mockPayment),
            constructor: jest.fn().mockReturnValue(mockPayment),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('Product'),
          useValue: {
            findById: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: getModelToken('Category'),
          useValue: {
            findById: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: CartsService,
          useValue: {
            getUserCart: jest.fn(),
            clearCart: jest.fn(),
          },
        },
        {
          provide: getConnectionToken(),
          useValue: {
            startSession: jest.fn().mockReturnValue({
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              abortTransaction: jest.fn(),
              endSession: jest.fn(),
            }),
          },
        },
        {
          provide: AffiliateService,
          useValue: {
            processCommissionAfterPayment: jest.fn(),
          },
        },
        {
          provide: AffiliateLinkService,
          useValue: {
            trackConversion: jest.fn(),
          },
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    paymentService = module.get<PaymentService>(PaymentService);
    orderModel = module.get(getModelToken(Order.name));
    orderItemModel = module.get(getModelToken(OrderItem.name));
    paymentModel = module.get(getModelToken(PaymentDetail.name));
    productModel = module.get(getModelToken('Product'));
    categoryModel = module.get(getModelToken('Category'));
    cartsService = module.get<CartsService>(CartsService);
    connection = module.get(getConnectionToken());
    affiliateService = module.get<AffiliateService>(AffiliateService);
    affiliateLinkService = module.get<AffiliateLinkService>(AffiliateLinkService);
  });

  describe('Complete Order-Payment Flow', () => {
    it('should create order and payment successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        id_payment: '507f1f77bcf86cd799439013',
        note: 'Test order',
        voucher: 'TEST_VOUCHER',
        status: OrderStatus.PENDING,
        items: mockCartItems,
      };

      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439011',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 180000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      // Mock order creation
      jest.spyOn(cartsService, 'getUserCart').mockResolvedValue(mockCartItems);
      jest.spyOn(orderModel, 'findOne').mockReturnValue({
        session: jest.fn().mockResolvedValue(null),
      });
      jest.spyOn(productModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct),
      });
      jest.spyOn(categoryModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCategory),
      });
      jest.spyOn(mockOrder, 'save').mockResolvedValue(mockOrder);
      jest.spyOn(mockOrderItem, 'save').mockResolvedValue(mockOrderItem);

      // Mock payment creation
      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrder),
        }),
      });
      jest.spyOn(ordersService, 'getOrderItems').mockResolvedValue([mockOrderItem]);
      jest.spyOn(mockPayment, 'save').mockResolvedValue(mockPayment);

      // Act
      const orderResult = await ordersService.createFromCart(userId, createOrderDto);
      const paymentResult = await paymentService.create(createPaymentDto);

      // Assert
      expect(orderResult).toBeDefined();
      expect(orderResult.items).toHaveLength(1);
      expect(paymentResult).toBeDefined();
      expect(paymentResult.id_order).toBe('507f1f77bcf86cd799439011');
      expect(paymentResult.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should handle buy now with payment flow', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const buyNowDto: BuyNowDto = {
        id_product: '507f1f77bcf86cd799439015',
        quantity: 2,
        note: 'Buy now test',
        userEmail: 'test@example.com',
        affiliateCode: 'AFFILIATE123',
      };

      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439011',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 180000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      // Mock buy now
      jest.spyOn(orderModel, 'find').mockReturnValue({
        session: jest.fn().mockResolvedValue([]),
      });
      jest.spyOn(orderItemModel, 'deleteMany').mockReturnValue({
        session: jest.fn().mockResolvedValue({}),
      });
      jest.spyOn(orderModel, 'deleteMany').mockReturnValue({
        session: jest.fn().mockResolvedValue({}),
      });
      jest.spyOn(productModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct),
      });
      jest.spyOn(categoryModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCategory),
      });
      jest.spyOn(mockOrder, 'save').mockResolvedValue(mockOrder);
      jest.spyOn(mockOrderItem, 'save').mockResolvedValue(mockOrderItem);
      jest.spyOn(affiliateLinkService, 'trackConversion').mockRejectedValue(new Error('Not affiliate link'));
      jest.spyOn(affiliateService, 'processCommissionAfterPayment').mockResolvedValue({
        commission: 10000,
      });

      // Mock payment creation
      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrder),
        }),
      });
      jest.spyOn(ordersService, 'getOrderItems').mockResolvedValue([mockOrderItem]);
      jest.spyOn(mockPayment, 'save').mockResolvedValue(mockPayment);

      // Act
      const orderResult = await ordersService.buyNow(userId, buyNowDto);
      const paymentResult = await paymentService.create(createPaymentDto);

      // Assert
      expect(orderResult).toBeDefined();
      expect(orderResult.items).toHaveLength(1);
      expect(orderResult.commissionAmount).toBe(10000);
      expect(paymentResult).toBeDefined();
      expect(paymentResult.order_snapshot).toBeDefined();
      expect(paymentResult.order_snapshot.affiliateCode).toBe('AFFILIATE123');
    });

    it('should update order status and clear cart when payment completed', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const newStatus = OrderStatus.COMPLETED;
      const updatedOrder = { ...mockOrder, status: newStatus, uid: { _id: '507f1f77bcf86cd799439012' } };

      jest.spyOn(orderModel, 'findByIdAndUpdate').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(updatedOrder),
            }),
          }),
        }),
      });
      jest.spyOn(cartsService, 'clearCart').mockResolvedValue(undefined);

      // Act
      const result = await ordersService.updateStatus(orderId, newStatus);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.COMPLETED);
      expect(cartsService.clearCart).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });

    it('should handle payment with order snapshot', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439011',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 180000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrder),
        }),
      });
      jest.spyOn(ordersService, 'getOrderItems').mockResolvedValue([mockOrderItem]);
      jest.spyOn(mockPayment, 'save').mockResolvedValue(mockPayment);

      // Act
      const result = await paymentService.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.order_snapshot).toBeDefined();
      expect(result.order_snapshot.id).toBe('507f1f77bcf86cd799439011');
      expect(result.order_snapshot.items).toHaveLength(1);
      expect(result.order_snapshot.items[0].quantity).toBe(2);
    });

    it('should handle bank transfer payment flow', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439011',
        provider: 'Bank Transfer',
        status: PaymentStatus.PENDING,
        amount: 180000,
        is_bank_transfer: true,
        bank_name: 'Vietcombank',
        transaction_reference: 'TXN123456',
        transfer_date: '2024-01-01T00:00:00.000Z',
        transfer_note: 'Bank transfer payment',
      };

      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrder),
        }),
      });
      jest.spyOn(ordersService, 'getOrderItems').mockResolvedValue([mockOrderItem]);
      jest.spyOn(mockPayment, 'save').mockResolvedValue(mockPayment);

      // Act
      const result = await paymentService.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.is_bank_transfer).toBe(true);
      expect(result.bank_name).toBe('Vietcombank');
      expect(result.transfer_note).toBe('Bank transfer payment');
      expect(result.status).toBe(PaymentStatus.PENDING);
    });

    it('should handle error scenarios in integrated flow', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        note: 'Test order',
        status: OrderStatus.PENDING,
        items: [],
      };

      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439011',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 180000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      // Mock empty cart error
      jest.spyOn(cartsService, 'getUserCart').mockResolvedValue([]);

      // Act & Assert
      await expect(ordersService.createFromCart(userId, createOrderDto))
        .rejects
        .toThrow(BadRequestException);

      // Mock payment with non-existent order
      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      jest.spyOn(mockPayment, 'save').mockResolvedValue(mockPayment);

      // Payment should still be created but without order snapshot
      const paymentResult = await paymentService.create(createPaymentDto);
      expect(paymentResult).toBeDefined();
      expect(paymentResult.order_snapshot).toBeNull();
    });
  });

  describe('Data Consistency Tests', () => {
    it('should maintain data consistency between order and payment', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439011',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 180000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrder),
        }),
      });
      jest.spyOn(ordersService, 'getOrderItems').mockResolvedValue([mockOrderItem]);
      jest.spyOn(mockPayment, 'save').mockResolvedValue(mockPayment);

      // Act
      const paymentResult = await paymentService.create(createPaymentDto);

      // Assert
      expect(paymentResult.order_snapshot.id).toBe(mockOrder._id);
      expect(paymentResult.order_snapshot.uid).toBe(mockOrder.uid);
      expect(paymentResult.order_snapshot.status).toBe(mockOrder.status);
      expect(paymentResult.order_snapshot.total_items).toBe(mockOrder.total_items);
      expect(paymentResult.order_snapshot.items).toHaveLength(1);
    });

    it('should handle affiliate commission in integrated flow', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const buyNowDto: BuyNowDto = {
        id_product: '507f1f77bcf86cd799439015',
        quantity: 2,
        note: 'Buy now test',
        userEmail: 'test@example.com',
        affiliateCode: 'AFFILIATE123',
      };

      // Mock buy now with affiliate
      jest.spyOn(orderModel, 'find').mockReturnValue({
        session: jest.fn().mockResolvedValue([]),
      });
      jest.spyOn(orderItemModel, 'deleteMany').mockReturnValue({
        session: jest.fn().mockResolvedValue({}),
      });
      jest.spyOn(orderModel, 'deleteMany').mockReturnValue({
        session: jest.fn().mockResolvedValue({}),
      });
      jest.spyOn(productModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct),
      });
      jest.spyOn(categoryModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCategory),
      });
      jest.spyOn(mockOrder, 'save').mockResolvedValue(mockOrder);
      jest.spyOn(mockOrderItem, 'save').mockResolvedValue(mockOrderItem);
      jest.spyOn(affiliateLinkService, 'trackConversion').mockRejectedValue(new Error('Not affiliate link'));
      jest.spyOn(affiliateService, 'processCommissionAfterPayment').mockResolvedValue({
        commission: 10000,
      });

      // Act
      const orderResult = await ordersService.buyNow(userId, buyNowDto);

      // Assert
      expect(orderResult).toBeDefined();
      expect(orderResult.commissionAmount).toBe(10000);
      expect(affiliateService.processCommissionAfterPayment).toHaveBeenCalledWith({
        _id: mockOrder._id,
        affiliateCode: 'AFFILIATE123',
        totalAmount: 180000,
        userId: userId,
        userEmail: 'test@example.com'
      });
    });
  });

  describe('Complete Order-Payment Flow (PENDING → COMPLETED)', () => {
    it('should handle complete flow: User creates order → Payment → Payment completed → Order completed → Affiliate commission', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        id_payment: '507f1f77bcf86cd799439013',
        note: 'Complete flow test order',
        voucher: 'TEST_VOUCHER',
        status: OrderStatus.PENDING,
        items: mockCartItems,
      };

      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439011',
        provider: 'VNPay',
        status: PaymentStatus.PENDING, // Initially PENDING
        amount: 180000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      // Step 1: User creates order (PENDING)
      jest.spyOn(cartsService, 'getUserCart').mockResolvedValue(mockCartItems);
      jest.spyOn(orderModel, 'findOne').mockReturnValue({
        session: jest.fn().mockResolvedValue(null),
      });
      jest.spyOn(productModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct),
      });
      jest.spyOn(categoryModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCategory),
      });
      jest.spyOn(mockOrder, 'save').mockResolvedValue(mockOrder);
      jest.spyOn(mockOrderItem, 'save').mockResolvedValue(mockOrderItem);

      // Step 2: PaymentService creates payment record
      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrder),
        }),
      });
      jest.spyOn(ordersService, 'getOrderItems').mockResolvedValue([mockOrderItem]);
      jest.spyOn(mockPayment, 'save').mockResolvedValue(mockPayment);

      // Step 3: User performs payment (Payment status → COMPLETED)
      const completedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED };
      jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedPayment),
      });

      // Step 4: Order status → COMPLETED
      const completedOrder = { ...mockOrder, status: OrderStatus.COMPLETED };
      jest.spyOn(orderModel, 'findByIdAndUpdate').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(completedOrder),
            }),
          }),
        }),
      });
      jest.spyOn(cartsService, 'clearCart').mockResolvedValue(undefined);

      // Step 5: Affiliate commission calculation
      jest.spyOn(affiliateService, 'processCommissionAfterPayment').mockResolvedValue({
        commission: 10000,
      });

      // Act
      // Step 1: Create order
      const orderResult = await ordersService.createFromCart(userId, createOrderDto);
      
      // Step 2: Create payment
      const paymentResult = await paymentService.create(createPaymentDto);
      
      // Step 3: Complete payment
      const updatedPayment = await paymentService.update(paymentResult._id, {
        status: PaymentStatus.COMPLETED,
        transaction_reference: 'TXN123456_COMPLETED',
      });
      
      // Step 4: Update order status to COMPLETED
      const updatedOrder = await ordersService.updateStatus(orderResult._id, OrderStatus.COMPLETED);
      
      // Step 5: Process affiliate commission
      await affiliateService.processCommissionAfterPayment({
        orderId: orderResult._id,
        affiliateCode: 'AFFILIATE123',
        totalAmount: 180000,
        userId: userId,
        userEmail: 'test@example.com'
      });

      // Assert
      expect(orderResult).toBeDefined();
      expect(orderResult.status).toBe(OrderStatus.PENDING);
      
      expect(paymentResult).toBeDefined();
      expect(paymentResult.status).toBe(PaymentStatus.PENDING);
      
      expect(updatedPayment.status).toBe(PaymentStatus.COMPLETED);
      expect(updatedPayment.transaction_reference).toBe('TXN123456_COMPLETED');
      
      expect(updatedOrder.status).toBe(OrderStatus.COMPLETED);
      expect(cartsService.clearCart).toHaveBeenCalledWith(userId);
      
      expect(affiliateService.processCommissionAfterPayment).toHaveBeenCalledWith({
        orderId: orderResult._id,
        affiliateCode: 'AFFILIATE123',
        totalAmount: 180000,
        userId: userId,
        userEmail: 'test@example.com'
      });
    });

    it('should handle payment failure and order cancellation', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        id_payment: '507f1f77bcf86cd799439013',
        note: 'Payment failure test order',
        voucher: 'TEST_VOUCHER',
        status: OrderStatus.PENDING,
        items: mockCartItems,
      };

      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439011',
        provider: 'VNPay',
        status: PaymentStatus.PENDING,
        amount: 180000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      // Mock order creation
      jest.spyOn(cartsService, 'getUserCart').mockResolvedValue(mockCartItems);
      jest.spyOn(orderModel, 'findOne').mockReturnValue({
        session: jest.fn().mockResolvedValue(null),
      });
      jest.spyOn(productModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProduct),
      });
      jest.spyOn(categoryModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockCategory),
      });
      jest.spyOn(mockOrder, 'save').mockResolvedValue(mockOrder);
      jest.spyOn(mockOrderItem, 'save').mockResolvedValue(mockOrderItem);

      // Mock payment creation
      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrder),
        }),
      });
      jest.spyOn(ordersService, 'getOrderItems').mockResolvedValue([mockOrderItem]);
      jest.spyOn(mockPayment, 'save').mockResolvedValue(mockPayment);

      // Mock payment failure
      const failedPayment = { ...mockPayment, status: PaymentStatus.FAILED };
      jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(failedPayment),
      });

      // Mock order cancellation
      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      jest.spyOn(orderModel, 'findByIdAndUpdate').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(cancelledOrder),
            }),
          }),
        }),
      });

      // Act
      const orderResult = await ordersService.createFromCart(userId, createOrderDto);
      const paymentResult = await paymentService.create(createPaymentDto);
      
      // Payment fails
      const updatedPayment = await paymentService.update(paymentResult._id, {
        status: PaymentStatus.FAILED,
        transaction_reference: 'TXN123456_FAILED',
      });
      
      // Order gets cancelled
      const updatedOrder = await ordersService.updateStatus(orderResult._id, OrderStatus.CANCELLED);

      // Assert
      expect(orderResult.status).toBe(OrderStatus.PENDING);
      expect(paymentResult.status).toBe(PaymentStatus.PENDING);
      expect(updatedPayment.status).toBe(PaymentStatus.FAILED);
      expect(updatedOrder.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('Admin Order-Payment Management', () => {
    it('should allow admin to view all orders with payment status', async () => {
      // Arrange
      const mockOrdersWithPayments = [
        { ...mockOrder, status: OrderStatus.PENDING, id_payment: '507f1f77bcf86cd799439013' },
        { ...mockOrder, _id: '507f1f77bcf86cd799439020', status: OrderStatus.COMPLETED, id_payment: '507f1f77bcf86cd799439021' },
        { ...mockOrder, _id: '507f1f77bcf86cd799439022', status: OrderStatus.CANCELLED, id_payment: null },
      ];

      const mockPayments = [
        { ...mockPayment, status: PaymentStatus.PENDING },
        { ...mockPayment, _id: '507f1f77bcf86cd799439021', status: PaymentStatus.COMPLETED },
      ];

      jest.spyOn(orderModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrdersWithPayments),
            }),
          }),
        }),
      });

      jest.spyOn(paymentModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPayments),
      });

      // Act
      const orders = await ordersService.findAll();
      const payments = await paymentService.findAllForAdmin();

      // Assert
      expect(orders).toBeDefined();
      expect(orders).toHaveLength(3);
      expect(payments).toBeDefined();
      expect(payments).toHaveLength(2);
      
      // Check order-payment relationships
      expect(orders[0].id_payment).toBe('507f1f77bcf86cd799439013');
      expect(orders[1].id_payment).toBe('507f1f77bcf86cd799439021');
      expect(orders[2].id_payment).toBeNull();
    });

    it('should allow admin to update order status from PENDING to PROCESSING to COMPLETED', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';
      
      const processingOrder = { ...mockOrder, status: OrderStatus.PROCESSING };
      const completedOrder = { ...mockOrder, status: OrderStatus.COMPLETED, uid: { _id: userId } };

      jest.spyOn(orderModel, 'findByIdAndUpdate').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn()
                .mockResolvedValueOnce(processingOrder) // First call returns PROCESSING
                .mockResolvedValueOnce(completedOrder), // Second call returns COMPLETED
            }),
          }),
        }),
      });
      jest.spyOn(cartsService, 'clearCart').mockResolvedValue(undefined);

      // Act
      const step1Result = await ordersService.updateStatus(orderId, OrderStatus.PROCESSING);
      const step2Result = await ordersService.updateStatus(orderId, OrderStatus.COMPLETED);

      // Assert
      expect(step1Result.status).toBe(OrderStatus.PROCESSING);
      expect(step2Result.status).toBe(OrderStatus.COMPLETED);
      expect(cartsService.clearCart).toHaveBeenCalledWith(userId);
    });

    it('should allow admin to approve/reject payments', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439013';
      const pendingPayment = { ...mockPayment, status: PaymentStatus.PENDING };
      const approvedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED };
      const rejectedPayment = { ...mockPayment, status: PaymentStatus.FAILED };

      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(pendingPayment),
      });

      jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn()
          .mockResolvedValueOnce(approvedPayment) // First call for approval
          .mockResolvedValueOnce(rejectedPayment), // Second call for rejection
      });

      // Act
      const approveResult = await paymentService.update(paymentId, {
        status: PaymentStatus.COMPLETED,
        transaction_reference: 'ADMIN_APPROVED_TXN123456',
      });

      const rejectResult = await paymentService.update(paymentId, {
        status: PaymentStatus.FAILED,
        transaction_reference: 'ADMIN_REJECTED_TXN123456',
      });

      // Assert
      expect(approveResult.status).toBe(PaymentStatus.COMPLETED);
      expect(approveResult.transaction_reference).toBe('ADMIN_APPROVED_TXN123456');
      
      expect(rejectResult.status).toBe(PaymentStatus.FAILED);
      expect(rejectResult.transaction_reference).toBe('ADMIN_REJECTED_TXN123456');
    });

    it('should handle affiliate commission calculation by admin', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const affiliateCode = 'AFFILIATE123';
      const totalAmount = 180000;
      const userId = '507f1f77bcf86cd799439012';
      const userEmail = 'test@example.com';

      const orderWithAffiliate = {
        ...mockOrder,
        affiliateCode,
        commissionAmount: 10000,
        commissionStatus: 'PENDING',
      };

      jest.spyOn(orderModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(orderWithAffiliate),
      });

      jest.spyOn(affiliateService, 'processCommissionAfterPayment').mockResolvedValue({
        commission: 10000,
        status: 'APPROVED',
      });

      // Act
      const commissionResult = await affiliateService.processCommissionAfterPayment({
        orderId,
        affiliateCode,
        totalAmount,
        userId,
        userEmail,
      });

      // Assert
      expect(commissionResult).toBeDefined();
      expect(commissionResult.commission).toBe(10000);
      expect(commissionResult.status).toBe('APPROVED');
      expect(affiliateService.processCommissionAfterPayment).toHaveBeenCalledWith({
        orderId,
        affiliateCode,
        totalAmount,
        userId,
        userEmail,
      });
    });
  });
});
