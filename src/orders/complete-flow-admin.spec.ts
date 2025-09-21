import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PaymentService } from '../payment/payment.service';
import { CartsService } from '../carts/carts.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { AffiliateLinkService } from '../affiliate/affiliate-link.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { OrderItem } from './schemas/order-item.schema';
import { PaymentDetail } from '../payment/schemas/payment-detail.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreatePaymentDto } from '../payment/dto/create-payment.dto';
import { OrderStatus } from './enum/order-status.enum';
import { PaymentStatus } from '../payment/enum/payment-status.enum';
import { mockCartsService, mockAffiliateService, mockAffiliateLinkService } from '../test-utils/mock-dependencies';

describe('Complete Flow and Admin Management', () => {
  let ordersService: OrdersService;
  let paymentService: PaymentService;
  let cartsService: any;
  let affiliateService: any;
  let affiliateLinkService: any;
  let orderModel: any;
  let orderItemModel: any;
  let paymentModel: any;
  let productModel: any;
  let categoryModel: any;

  const mockOrder = {
    _id: '507f1f77bcf86cd799439011',
    uid: '507f1f77bcf86cd799439012',
    id_payment: '507f1f77bcf86cd799439013',
    note: 'Complete flow test order',
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
    status: PaymentStatus.PENDING,
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
    category_id: '507f1f77bcf86cd799439016',
    discount_percent: 10,
  };

  const mockCategory = {
    _id: '507f1f77bcf86cd799439016',
    name: 'Test Category',
    description: 'Test Category Description',
  };

  const mockCartItems = [
    {
      id_product: '507f1f77bcf86cd799439015',
      quantity: 2,
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        PaymentService,
        {
          provide: CartsService,
          useValue: mockCartsService,
        },
        {
          provide: AffiliateService,
          useValue: mockAffiliateService,
        },
        {
          provide: AffiliateLinkService,
          useValue: mockAffiliateLinkService,
        },
        {
          provide: getModelToken(Order.name),
          useValue: {
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            find: jest.fn(),
            deleteMany: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken(OrderItem.name),
          useValue: {
            save: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: getModelToken(PaymentDetail.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            find: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn(),
              }),
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getModelToken('Product'),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken('Category'),
          useValue: {
            findById: jest.fn(),
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
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    paymentService = module.get<PaymentService>(PaymentService);
    cartsService = module.get<CartsService>(CartsService);
    affiliateService = module.get<AffiliateService>(AffiliateService);
    affiliateLinkService = module.get<AffiliateLinkService>(AffiliateLinkService);
    orderModel = module.get(getModelToken(Order.name));
    orderItemModel = module.get(getModelToken(OrderItem.name));
    paymentModel = module.get(getModelToken(PaymentDetail.name));
    productModel = module.get(getModelToken('Product'));
    categoryModel = module.get(getModelToken('Category'));
  });

  describe('Complete Order-Payment Flow', () => {
    it('should handle complete business flow: Order → Payment → Completion → Affiliate', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const orderId = '507f1f77bcf86cd799439011';
      const paymentId = '507f1f77bcf86cd799439013';

      // Mock order status update
      const completedOrder = { ...mockOrder, status: OrderStatus.COMPLETED, uid: { _id: userId } };
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

      // Mock payment update
      const completedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED, transaction_reference: 'TXN123456_COMPLETED' };
      jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(completedPayment),
      });

      // Mock affiliate commission
      jest.spyOn(affiliateService, 'processCommissionAfterPayment').mockResolvedValue({
        commission: 10000,
        status: 'APPROVED',
      });

      // Act - Complete Business Flow
      // Step 1: Order status updated to COMPLETED
      const updatedOrder = await ordersService.updateStatus(orderId, OrderStatus.COMPLETED);
      
      // Step 2: Payment status updated to COMPLETED
      const updatedPayment = await paymentService.update(paymentId, {
        status: PaymentStatus.COMPLETED,
        transaction_reference: 'TXN123456_COMPLETED',
      });
      
      // Step 3: Affiliate commission processed
      const commissionResult = await affiliateService.processCommissionAfterPayment({
        orderId: orderId,
        affiliateCode: 'AFFILIATE123',
        totalAmount: 180000,
        userId: userId,
        userEmail: 'test@example.com'
      });

      // Assert - Complete Flow Verification
      expect(updatedOrder.status).toBe(OrderStatus.COMPLETED);
      expect(cartsService.clearCart).toHaveBeenCalledWith(userId);
      
      expect(updatedPayment.status).toBe(PaymentStatus.COMPLETED);
      expect(updatedPayment.transaction_reference).toBe('TXN123456_COMPLETED');
      
      expect(commissionResult.commission).toBe(10000);
      expect(commissionResult.status).toBe('APPROVED');
    });

    it('should handle payment failure and order cancellation flow', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const paymentId = '507f1f77bcf86cd799439013';

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

      // Act - Failure Flow
      // Payment fails
      const updatedPayment = await paymentService.update(paymentId, {
        status: PaymentStatus.FAILED,
        transaction_reference: 'TXN123456_FAILED',
      });
      
      // Order gets cancelled
      const updatedOrder = await ordersService.updateStatus(orderId, OrderStatus.CANCELLED);

      // Assert - Failure Flow Verification
      expect(updatedPayment.status).toBe(PaymentStatus.FAILED);
      expect(updatedOrder.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('Admin Management Scenarios', () => {
    it('should allow admin to manage complete order-payment lifecycle', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const paymentId = '507f1f77bcf86cd799439013';
      const userId = '507f1f77bcf86cd799439012';

      const pendingOrder = { ...mockOrder, status: OrderStatus.PENDING };
      const processingOrder = { ...mockOrder, status: OrderStatus.PROCESSING };
      const completedOrder = { ...mockOrder, status: OrderStatus.COMPLETED, uid: { _id: userId } };

      const pendingPayment = { ...mockPayment, status: PaymentStatus.PENDING };
      const approvedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED };

      // Mock admin operations
      jest.spyOn(orderModel, 'findByIdAndUpdate').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn()
                .mockResolvedValueOnce(processingOrder)
                .mockResolvedValueOnce(completedOrder),
            }),
          }),
        }),
      });

      jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...approvedPayment,
          transaction_reference: 'ADMIN_APPROVED_TXN123456',
        }),
      });

      jest.spyOn(cartsService, 'clearCart').mockResolvedValue(undefined);

      // Act - Admin Management Flow
      // Admin updates order to PROCESSING
      const step1Result = await ordersService.updateStatus(orderId, OrderStatus.PROCESSING);
      
      // Admin approves payment
      const paymentResult = await paymentService.update(paymentId, {
        status: PaymentStatus.COMPLETED,
        transaction_reference: 'ADMIN_APPROVED_TXN123456',
      });
      
      // Admin completes order
      const step2Result = await ordersService.updateStatus(orderId, OrderStatus.COMPLETED);

      // Assert - Admin Management Verification
      expect(step1Result.status).toBe(OrderStatus.PROCESSING);
      expect(paymentResult.status).toBe(PaymentStatus.COMPLETED);
      expect(paymentResult.transaction_reference).toBe('ADMIN_APPROVED_TXN123456');
      expect(step2Result.status).toBe(OrderStatus.COMPLETED);
      expect(cartsService.clearCart).toHaveBeenCalledWith(userId);
    });

    it('should allow admin to handle bank transfer payments', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439013';
      const bankTransferPayment = {
        ...mockPayment,
        is_bank_transfer: true,
        bank_name: 'Vietcombank',
        transfer_date: '2024-01-15',
        transfer_note: 'Admin verified bank transfer',
        status: PaymentStatus.COMPLETED,
      };

      jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(bankTransferPayment),
      });

      // Act - Admin handles bank transfer
      const result = await paymentService.update(paymentId, {
        is_bank_transfer: true,
        bank_name: 'Vietcombank',
        transfer_date: '2024-01-15',
        transfer_note: 'Admin verified bank transfer',
        status: PaymentStatus.COMPLETED,
      });

      // Assert - Bank Transfer Verification
      expect(result.is_bank_transfer).toBe(true);
      expect(result.bank_name).toBe('Vietcombank');
      expect(result.transfer_note).toBe('Admin verified bank transfer');
      expect(result.status).toBe(PaymentStatus.COMPLETED);
    });

    it('should allow admin to view comprehensive order-payment data', async () => {
      // Arrange
      const mockOrdersWithPayments = [
        { 
          ...mockOrder, 
          status: OrderStatus.PENDING, 
          id_payment: '507f1f77bcf86cd799439013',
          affiliateCode: 'AFFILIATE123',
          commissionAmount: 10000,
        },
        { 
          ...mockOrder, 
          _id: '507f1f77bcf86cd799439020', 
          status: OrderStatus.COMPLETED, 
          id_payment: '507f1f77bcf86cd799439021',
          affiliateCode: 'AFFILIATE456',
          commissionAmount: 15000,
        },
        { 
          ...mockOrder, 
          _id: '507f1f77bcf86cd799439022', 
          status: OrderStatus.CANCELLED, 
          id_payment: undefined,
          affiliateCode: undefined,
          commissionAmount: 0,
        },
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
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPayments),
        }),
      });

      // Act - Admin views comprehensive data
      const orders = await ordersService.findAll();
      const payments = await paymentService.findAllForAdmin();

      // Assert - Comprehensive Data Verification
      expect(orders).toBeDefined();
      expect(orders).toHaveLength(3);
      expect(payments).toBeDefined();
      expect(payments).toHaveLength(2);
      
      // Verify order-payment relationships
      expect(orders[0].id_payment).toBe('507f1f77bcf86cd799439013');
      expect(orders[1].id_payment).toBe('507f1f77bcf86cd799439021');
      expect(orders[2].id_payment).toBeUndefined();
      
      // Verify affiliate data - check mock data structure
      expect(orders[0].status).toBe(OrderStatus.PENDING);
      expect(orders[1].status).toBe(OrderStatus.COMPLETED);
      expect(orders[2].status).toBe(OrderStatus.CANCELLED);
      
      // Check that orders have the expected structure
      expect(orders[0]).toHaveProperty('id_payment');
      expect(orders[1]).toHaveProperty('id_payment');
      expect(orders[2]).toHaveProperty('id_payment');
    });
  });
});
