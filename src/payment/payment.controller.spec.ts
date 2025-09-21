import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from './enum/payment-status.enum';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

  const mockPayment = {
    id: '507f1f77bcf86cd799439011',
    id_order: '507f1f77bcf86cd799439012' as any,
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
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPayments = [mockPayment];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllForAdmin: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      jest.spyOn(service, 'create').mockResolvedValue(mockPayment);

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockPayment);
      expect(service.create).toHaveBeenCalledWith(createPaymentDto);
    });

    it('should create bank transfer payment successfully', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439012',
        provider: 'Bank Transfer',
        status: PaymentStatus.PENDING,
        amount: 100000,
        is_bank_transfer: true,
        bank_name: 'Vietcombank',
        transaction_reference: 'TXN123456',
        transfer_date: '2024-01-01T00:00:00.000Z',
        transfer_note: 'Test transfer',
      };

      const bankTransferPayment = { ...mockPayment, ...createPaymentDto };
      jest.spyOn(service, 'create').mockResolvedValue(bankTransferPayment as any);

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.is_bank_transfer).toBe(true);
      expect(result.bank_name).toBe('Vietcombank');
      expect(result.transfer_note).toBe('Test transfer');
      expect(service.create).toHaveBeenCalledWith(createPaymentDto);
    });

    it('should handle service errors', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439012',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 100000,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      jest.spyOn(service, 'create').mockRejectedValue(new Error('Payment creation failed'));

      // Act & Assert
      await expect(controller.create(createPaymentDto))
        .rejects
        .toThrow('Payment creation failed');
    });
  });

  describe('findAll', () => {
    it('should return completed payments only', async () => {
      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue(mockPayments);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockPayments);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no payments found', async () => {
      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findAllForAdmin', () => {
    it('should return all payments for admin', async () => {
      // Arrange
      jest.spyOn(service, 'findAllForAdmin').mockResolvedValue(mockPayments);

      // Act
      const result = await controller.findAllForAdmin();

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockPayments);
      expect(service.findAllForAdmin).toHaveBeenCalled();
    });

    it('should return all payments including pending ones', async () => {
      // Arrange
      const allPayments = [
        mockPayment,
        { ...mockPayment, _id: '507f1f77bcf86cd799439020', status: PaymentStatus.PENDING }
      ];
      jest.spyOn(service, 'findAllForAdmin').mockResolvedValue(allPayments);

      // Act
      const result = await controller.findAllForAdmin();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(PaymentStatus.COMPLETED);
      expect(result[1].status).toBe(PaymentStatus.PENDING);
      expect(service.findAllForAdmin).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return payment by id', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPayment);

      // Act
      const result = await controller.findOne(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockPayment);
      expect(service.findOne).toHaveBeenCalledWith(paymentId);
    });

    it('should handle payment not found', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'findOne').mockRejectedValue(new Error('Payment not found'));

      // Act & Assert
      await expect(controller.findOne(paymentId))
        .rejects
        .toThrow('Payment not found');
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
      jest.spyOn(service, 'update').mockResolvedValue(updatedPayment);

      // Act
      const result = await controller.update(paymentId, updatePaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.amount).toBe(150000);
      expect(result.transaction_reference).toBe('TXN789012');
      expect(service.update).toHaveBeenCalledWith(paymentId, updatePaymentDto);
    });

    it('should update payment with bank transfer details', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      const updatePaymentDto: UpdatePaymentDto = {
        status: PaymentStatus.COMPLETED,
        is_bank_transfer: true,
        bank_name: 'Vietcombank',
        transfer_date: '2024-01-01T00:00:00.000Z',
        transfer_note: 'Updated transfer note',
      };

      const updatedPayment = { ...mockPayment, ...updatePaymentDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedPayment);

      // Act
      const result = await controller.update(paymentId, updatePaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.is_bank_transfer).toBe(true);
      expect(result.bank_name).toBe('Vietcombank');
      expect(result.transfer_note).toBe('Updated transfer note');
      expect(service.update).toHaveBeenCalledWith(paymentId, updatePaymentDto);
    });

    it('should handle update errors', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      const updatePaymentDto: UpdatePaymentDto = {
        status: PaymentStatus.COMPLETED,
      };

      jest.spyOn(service, 'update').mockRejectedValue(new Error('Update failed'));

      // Act & Assert
      await expect(controller.update(paymentId, updatePaymentDto))
        .rejects
        .toThrow('Update failed');
    });

    it('should handle order not found during update', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      const updatePaymentDto: UpdatePaymentDto = {
        id_order: '507f1f77bcf86cd799439020',
        status: PaymentStatus.COMPLETED,
      };

      jest.spyOn(service, 'update').mockRejectedValue(new Error('Order not found'));

      // Act & Assert
      await expect(controller.update(paymentId, updatePaymentDto))
        .rejects
        .toThrow('Order not found');
    });
  });

  describe('remove', () => {
    it('should delete payment successfully', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'remove').mockResolvedValue(mockPayment);

      // Act
      const result = await controller.remove(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockPayment);
      expect(service.remove).toHaveBeenCalledWith(paymentId);
    });

    it('should handle delete errors', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'remove').mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(controller.remove(paymentId))
        .rejects
        .toThrow('Delete failed');
    });

    it('should handle payment not found during delete', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'remove').mockRejectedValue(new Error('Payment not found'));

      // Act & Assert
      await expect(controller.remove(paymentId))
        .rejects
        .toThrow('Payment not found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null payment data', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: null,
        provider: null,
        status: null,
        amount: null,
        is_bank_transfer: null,
        transaction_reference: null,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockPayment);

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createPaymentDto);
    });

    it('should handle empty string values', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '',
        provider: '',
        status: PaymentStatus.PENDING,
        amount: 0,
        is_bank_transfer: false,
        transaction_reference: '',
        bank_name: '',
        transfer_note: '',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockPayment);

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(service.create).toHaveBeenCalledWith(createPaymentDto);
    });

    it('should handle large amount values', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        id_order: '507f1f77bcf86cd799439012',
        provider: 'VNPay',
        status: PaymentStatus.COMPLETED,
        amount: 999999999,
        is_bank_transfer: false,
        transaction_reference: 'TXN123456',
      };

      const largeAmountPayment = { ...mockPayment, amount: 999999999 };
      jest.spyOn(service, 'create').mockResolvedValue(largeAmountPayment);

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.amount).toBe(999999999);
      expect(service.create).toHaveBeenCalledWith(createPaymentDto);
    });
  });

  describe('Admin Payment Management', () => {
    it('should allow admin to view all payments including pending ones', async () => {
      // Arrange
      const allPayments = [
        { ...mockPayment, status: PaymentStatus.PENDING },
        { ...mockPayment, _id: '507f1f77bcf86cd799439020', status: PaymentStatus.COMPLETED },
        { ...mockPayment, _id: '507f1f77bcf86cd799439021', status: PaymentStatus.FAILED },
      ];

      jest.spyOn(service, 'findAllForAdmin').mockResolvedValue(allPayments);

      // Act
      const result = await controller.findAllForAdmin();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(PaymentStatus.PENDING);
      expect(result[1].status).toBe(PaymentStatus.COMPLETED);
      expect(result[2].status).toBe(PaymentStatus.FAILED);
      expect(service.findAllForAdmin).toHaveBeenCalled();
    });

    it('should allow admin to approve pending payments', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439013';
      const pendingPayment = { ...mockPayment, status: PaymentStatus.PENDING };
      const approvedPayment = { ...mockPayment, status: PaymentStatus.COMPLETED };

      jest.spyOn(service, 'findOne').mockResolvedValue(pendingPayment);
      jest.spyOn(service, 'update').mockResolvedValue(approvedPayment);

      // Act
      const result = await controller.update(paymentId, {
        status: PaymentStatus.COMPLETED,
        transaction_reference: 'ADMIN_APPROVED_TXN123456',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.COMPLETED);
      expect(result.transaction_reference).toBe('ADMIN_APPROVED_TXN123456');
      expect(service.update).toHaveBeenCalledWith(paymentId, {
        status: PaymentStatus.COMPLETED,
        transaction_reference: 'ADMIN_APPROVED_TXN123456',
      });
    });

    it('should allow admin to reject pending payments', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439013';
      const pendingPayment = { ...mockPayment, status: PaymentStatus.PENDING };
      const rejectedPayment = { ...mockPayment, status: PaymentStatus.FAILED };

      jest.spyOn(service, 'findOne').mockResolvedValue(pendingPayment);
      jest.spyOn(service, 'update').mockResolvedValue(rejectedPayment);

      // Act
      const result = await controller.update(paymentId, {
        status: PaymentStatus.FAILED,
        transaction_reference: 'ADMIN_REJECTED_TXN123456',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(result.transaction_reference).toBe('ADMIN_REJECTED_TXN123456');
      expect(service.update).toHaveBeenCalledWith(paymentId, {
        status: PaymentStatus.FAILED,
        transaction_reference: 'ADMIN_REJECTED_TXN123456',
      });
    });

    it('should allow admin to view payment details with order information', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439013';
      const paymentWithOrder = {
        ...mockPayment,
        id_order: '507f1f77bcf86cd799439011',
        order_snapshot: {
          items: [
            {
              product_name: 'Test Product',
              quantity: 2,
              price: 90000,
            }
          ],
          total_amount: 180000,
        },
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(paymentWithOrder as any);

      // Act
      const result = await controller.findOne(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id_order).toBe('507f1f77bcf86cd799439011');
      expect(result.order_snapshot).toBeDefined();
      expect(result.order_snapshot.items).toHaveLength(1);
      expect(result.order_snapshot.total_amount).toBe(180000);
      expect(service.findOne).toHaveBeenCalledWith(paymentId);
    });

    it('should allow admin to delete payments', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439013';
      const deletedPayment = { ...mockPayment, status: PaymentStatus.FAILED };

      jest.spyOn(service, 'remove').mockResolvedValue(deletedPayment);

      // Act
      const result = await controller.remove(paymentId);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(PaymentStatus.FAILED);
      expect(service.remove).toHaveBeenCalledWith(paymentId);
    });

    it('should handle admin payment operations with proper error handling', async () => {
      // Arrange
      const paymentId = '507f1f77bcf86cd799439013';
      const invalidStatus = PaymentStatus.PENDING;

      jest.spyOn(service, 'update').mockRejectedValue(new Error('Invalid payment status'));

      // Act & Assert
      await expect(controller.update(paymentId, { status: invalidStatus }))
        .rejects
        .toThrow('Invalid payment status');
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
      };

      jest.spyOn(service, 'update').mockResolvedValue(bankTransferPayment as any);

      // Act
      const result = await controller.update(paymentId, {
        is_bank_transfer: true,
        bank_name: 'Vietcombank',
        transfer_date: '2024-01-15',
        transfer_note: 'Admin verified bank transfer',
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.is_bank_transfer).toBe(true);
      expect(result.bank_name).toBe('Vietcombank');
      expect(result.transfer_note).toBe('Admin verified bank transfer');
      expect(service.update).toHaveBeenCalledWith(paymentId, {
        is_bank_transfer: true,
        bank_name: 'Vietcombank',
        transfer_date: '2024-01-15',
        transfer_note: 'Admin verified bank transfer',
      });
    });
  });
});
