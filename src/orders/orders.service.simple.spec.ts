import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { OrderItem } from './schemas/order-item.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { BuyNowDto } from './dto/buy-now.dto';
import { OrderStatus } from './enum/order-status.enum';
import { CartsService } from '../carts/carts.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { AffiliateLinkService } from '../affiliate/affiliate-link.service';
import { 
  mockCartsService,
  mockAffiliateService,
  mockAffiliateLinkService,
  mockConnection,
  createMockModel 
} from '../test-utils/mock-dependencies';

describe('OrdersService - Simple Tests', () => {
  let service: OrdersService;
  let orderModel: any;
  let orderItemModel: any;
  let productModel: any;
  let categoryModel: any;

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
          useValue: createMockModel(mockOrder),
        },
        {
          provide: getModelToken(OrderItem.name),
          useValue: createMockModel(mockOrderItem),
        },
        {
          provide: getModelToken('Product'),
          useValue: createMockModel(mockProduct),
        },
        {
          provide: getModelToken('Category'),
          useValue: createMockModel(mockCategory),
        },
        {
          provide: CartsService,
          useValue: mockCartsService,
        },
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
        {
          provide: AffiliateService,
          useValue: mockAffiliateService,
        },
        {
          provide: AffiliateLinkService,
          useValue: mockAffiliateLinkService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderModel = module.get(getModelToken(Order.name));
    orderItemModel = module.get(getModelToken(OrderItem.name));
    productModel = module.get(getModelToken('Product'));
    categoryModel = module.get(getModelToken('Category'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromCart', () => {
    it('should throw BadRequestException when cart is empty', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        note: 'Test order',
        status: OrderStatus.PENDING,
        items: [],
      };

      jest.spyOn(mockCartsService, 'getUserCart').mockResolvedValue([]);

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

      jest.spyOn(mockCartsService, 'getUserCart').mockResolvedValue(mockCartItems);
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
