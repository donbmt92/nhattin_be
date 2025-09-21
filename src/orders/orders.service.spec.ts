import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { OrdersService } from './orders.service';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderItem, OrderItemDocument } from './schemas/order-item.schema';
import { CartsService } from '../carts/carts.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { AffiliateLinkService } from '../affiliate/affiliate-link.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BuyNowDto } from './dto/buy-now.dto';
import { OrderStatus } from './enum/order-status.enum';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: any;
  let orderItemModel: any;
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

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get(getModelToken(Order.name));
    orderItemModel = module.get(getModelToken(OrderItem.name));
    productModel = module.get(getModelToken('Product'));
    categoryModel = module.get(getModelToken('Category'));
    cartsService = module.get<CartsService>(CartsService);
    connection = module.get(getConnectionToken());
    affiliateService = module.get<AffiliateService>(AffiliateService);
    affiliateLinkService = module.get<AffiliateLinkService>(AffiliateLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromCart', () => {
    it('should create order from cart successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        id_payment: '507f1f77bcf86cd799439013',
        note: 'Test order',
        voucher: 'TEST_VOUCHER',
        status: OrderStatus.PENDING,
        items: mockCartItems,
      };

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

      // Act
      const result = await service.createFromCart(userId, createOrderDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(2);
      expect(result.items[0].final_price).toBe(90000);
    });

    it('should throw BadRequestException when cart is empty', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        note: 'Test order',
        status: OrderStatus.PENDING,
        items: [],
      };

      jest.spyOn(cartsService, 'getUserCart').mockResolvedValue([]);

      // Act & Assert
      await expect(service.createFromCart(userId, createOrderDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException when product not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        note: 'Test order',
        status: OrderStatus.PENDING,
        items: mockCartItems,
      };

      jest.spyOn(cartsService, 'getUserCart').mockResolvedValue(mockCartItems);
      jest.spyOn(orderModel, 'findOne').mockReturnValue({
        session: jest.fn().mockResolvedValue(null),
      });
      jest.spyOn(productModel, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(service.createFromCart(userId, createOrderDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('buyNow', () => {
    it('should create order with buy now successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const buyNowDto: BuyNowDto = {
        id_product: '507f1f77bcf86cd799439015',
        quantity: 2,
        note: 'Buy now test',
        userEmail: 'test@example.com',
      };

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

      // Act
      const result = await service.buyNow(userId, buyNowDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(2);
    });

    it('should throw BadRequestException when product not found', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const buyNowDto: BuyNowDto = {
        id_product: '507f1f77bcf86cd799439015',
        quantity: 2,
        note: 'Buy now test',
        userEmail: 'test@example.com',
      };

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
        lean: jest.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(service.buyNow(userId, buyNowDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException when quantity is invalid', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const buyNowDto: BuyNowDto = {
        id_product: '507f1f77bcf86cd799439015',
        quantity: 0,
        note: 'Buy now test',
        userEmail: 'test@example.com',
      };

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

      // Act & Assert
      await expect(service.buyNow(userId, buyNowDto))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should handle affiliate commission when affiliate code provided', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const buyNowDto: BuyNowDto = {
        id_product: '507f1f77bcf86cd799439015',
        quantity: 2,
        note: 'Buy now test',
        userEmail: 'test@example.com',
        affiliateCode: 'AFFILIATE123',
      };

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
      const result = await service.buyNow(userId, buyNowDto);

      // Assert
      expect(result).toBeDefined();
      expect(affiliateService.processCommissionAfterPayment).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      // Arrange
      const mockOrders = [mockOrder];
      jest.spyOn(orderModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrders),
            }),
          }),
        }),
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(orderModel.find).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return orders for specific user', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const mockOrders = [mockOrder];
      const mockOrderItems = [mockOrderItem];

      jest.spyOn(orderModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrders),
            }),
          }),
        }),
      });
      jest.spyOn(orderItemModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockOrderItems),
        }),
      });

      // Act
      const result = await service.findByUser(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });

  describe('findSuccessOrders', () => {
    it('should return completed orders for specific user', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const mockOrders = [mockOrder];
      const mockOrderItems = [mockOrderItem];

      jest.spyOn(orderModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrders),
            }),
          }),
        }),
      });
      jest.spyOn(orderItemModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockOrderItems),
        }),
      });

      // Act
      const result = await service.findSuccessOrders(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      jest.spyOn(orderModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockOrder),
            }),
          }),
        }),
      });

      // Act
      const result = await service.findOne(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(orderModel.findById).toHaveBeenCalledWith(orderId);
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const newStatus = OrderStatus.COMPLETED;
      const updatedOrder = { ...mockOrder, status: newStatus };

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
      const result = await service.updateStatus(orderId, newStatus);

      // Assert
      expect(result).toBeDefined();
      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        { status: newStatus },
        { new: true }
      );
    });

    it('should clear cart when order status is completed', async () => {
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
      await service.updateStatus(orderId, newStatus);

      // Assert
      expect(cartsService.clearCart).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });
  });

  describe('getOrderItems', () => {
    it('should return order items for given order id', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const mockOrderItems = [mockOrderItem];

      jest.spyOn(orderItemModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrderItems),
        }),
      });

      // Act
      const result = await service.getOrderItems(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(2);
    });

    it('should return empty array when no order items found', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';

      jest.spyOn(orderItemModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      // Act
      const result = await service.getOrderItems(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
});
