import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PaymentService } from './payment.service';
import { PaymentDetail } from './schemas/payment-detail.schema';
import { Order } from '../orders/schemas/order.schema';
import { OrdersService } from '../orders/orders.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from './enum/payment-status.enum';

// Mock đơn giản cho OrdersService
const mockOrdersService = {
  findOne: jest.fn(),
  getOrderItems: jest.fn(),
};

describe('PaymentService - Simple Tests', () => {
  let service: PaymentService;
  let paymentModel: any;
  let orderModel: any;

  const mockPayment = {
    _id: '507f1f77bcf86cd799439011',
    id_order: '507f1f77bcf86cd799439012',
    provider: 'VNPay',
    status: PaymentStatus.COMPLETED,
    amount: 100000,
    is_bank_transfer: false,
    bank_name: null,
    transaction_reference: 'TXN123456',
    transfer_date: null,
    transfer_note: null,
    order_snapshot: {
      id: '507f1f77bcf86cd799439012',
      uid: '507f1f77bcf86cd799439013',
      status: 'pending',
      total_items: 2,
      note: 'Test order',
      voucher: 'TEST_VOUCHER',
      affiliateCode: 'AFFILIATE123',
      commissionAmount: 10000,
      commissionStatus: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          id: '507f1f77bcf86cd799439014',
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
          }
        }
      ]
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockOrder = {
    _id: '507f1f77bcf86cd799439012',
    uid: '507f1f77bcf86cd799439013',
    status: 'pending',
    total_items: 2,
    note: 'Test order',
    voucher: 'TEST_VOUCHER',
    affiliateCode: 'AFFILIATE123',
    commissionAmount: 10000,
    commissionStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrderItems = [
    {
      id: '507f1f77bcf86cd799439014',
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
      }
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getModelToken(PaymentDetail.name),
          useValue: Object.assign(
            jest.fn().mockImplementation((data) => ({
              ...data,
              save: jest.fn().mockResolvedValue({ ...data, _id: '507f1f77bcf86cd799439011' }),
            })),
            {
              find: jest.fn(),
              findById: jest.fn(),
              findByIdAndUpdate: jest.fn(),
              findByIdAndDelete: jest.fn(),
              exec: jest.fn(),
              lean: jest.fn(),
              populate: jest.fn(),
            }
          ),
        },
        {
          provide: getModelToken(Order.name),
          useValue: {
            findById: jest.fn(),
            find: jest.fn(),
            exec: jest.fn(),
            lean: jest.fn(),
          },
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    paymentModel = module.get(getModelToken(PaymentDetail.name));
    orderModel = module.get(getModelToken(Order.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create payment successfully', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439012',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 100000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrder),
        }),
      });
      jest.spyOn(mockOrdersService, 'getOrderItems').mockResolvedValue(mockOrderItems);

      // Act
      const result = await service.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id_order.toString()).toBe(createPaymentDto.id_order);
      expect(result.provider).toBe(createPaymentDto.provider);
      expect(result.status).toBe(createPaymentDto.status);
      expect(result.amount).toBe(createPaymentDto.amount);
    });

    it('should create payment without order snapshot when order not found', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439012',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 100000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      jest.spyOn(orderModel, 'findById').mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      // Act
      const result = await service.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id_order.toString()).toBe(createPaymentDto.id_order);
      expect(result.order_snapshot).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return completed payments only', async () => {
      // Arrange
      const mockPayments = [mockPayment];
      jest.spyOn(paymentModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPayments),
        }),
      });

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(paymentModel.find).toHaveBeenCalledWith({ status: 'completed' });
    });
  });

  describe('findAllForAdmin', () => {
    it('should return all payments for admin', async () => {
      // Arrange
      const mockPayments = [mockPayment];
      jest.spyOn(paymentModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPayments),
        }),
      });

      // Act
      const result = await service.findAllForAdmin();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(paymentModel.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('should return payment by id', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPayment),
        }),
      });

      // Act
      const result = await service.findOne(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(paymentModel.findById).toHaveBeenCalled();
    });

    it('should throw error when payment not found', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      // Act & Assert
      await expect(service.findOne(paymentId))
        .rejects
        .toThrow();
    });
  });

  describe('update', () => {
    it('should update payment successfully', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      const updatePaymentDto: UpdatePaymentDto = {
        status: PaymentStatus.COMPLETED,
        amount: 150000,
        transaction_reference: 'TXN789012',
      };

      const updatedPayment = { ...mockPayment, ...updatePaymentDto };
      jest.spyOn(mockOrdersService, 'findOne').mockResolvedValue(mockOrder);
      jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPayment),
      });

      // Act
      const result = await service.update(paymentId, updatePaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.amount).toBe(150000);
    });
  });

  describe('remove', () => {
    it('should delete payment successfully', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(paymentModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPayment),
      });

      // Act
      const result = await service.remove(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(paymentModel.findByIdAndDelete).toHaveBeenCalled();
    });

    it('should throw error when payment not found', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(paymentModel, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(service.remove(paymentId))
        .rejects
        .toThrow();
    });
  });
});
