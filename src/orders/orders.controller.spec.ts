import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BuyNowDto } from './dto/buy-now.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enum/order-status.enum';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrder = {
    id: '507f1f77bcf86cd799439011',
    uid: '507f1f77bcf86cd799439012',
    id_payment: '507f1f77bcf86cd799439013',
    note: 'Test order',
    voucher: 'TEST_VOUCHER',
    status: OrderStatus.PENDING,
    total_items: 2,
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
    ],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockOrders = [mockOrder];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createFromCart: jest.fn(),
            buyNow: jest.fn(),
            findAll: jest.fn(),
            findByUser: jest.fn(),
            findSuccessOrders: jest.fn(),
            findOne: jest.fn(),
            updateStatus: jest.fn(),
            remove: jest.fn(),
            getOrderItems: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create order from cart successfully', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        id_payment: '507f1f77bcf86cd799439013',
        note: 'Test order',
        voucher: 'TEST_VOUCHER',
        status: OrderStatus.PENDING,
        items: [
          {
            id_product: '507f1f77bcf86cd799439015',
            quantity: 2
          }
        ],
      };

      jest.spyOn(service, 'createFromCart').mockResolvedValue(mockOrder);

      // Act
      const result = await controller.create(userId, createOrderDto);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrder);
      expect(service.createFromCart).toHaveBeenCalledWith(userId, createOrderDto);
    });

    it('should handle service errors', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const createOrderDto: CreateOrderDto = {
        note: 'Test order',
        status: OrderStatus.PENDING,
        items: [],
      };

      jest.spyOn(service, 'createFromCart').mockRejectedValue(new BadRequestException('Giỏ hàng trống'));

      // Act & Assert
      await expect(controller.create(userId, createOrderDto))
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

      jest.spyOn(service, 'buyNow').mockResolvedValue(mockOrder);

      // Act
      const result = await controller.buyNow(userId, buyNowDto);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrder);
      expect(service.buyNow).toHaveBeenCalledWith(userId, buyNowDto);
    });

    it('should handle service errors', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      const buyNowDto: BuyNowDto = {
        id_product: '507f1f77bcf86cd799439015',
        quantity: 0,
        note: 'Buy now test',
        userEmail: 'test@example.com',
      };

      jest.spyOn(service, 'buyNow').mockRejectedValue(new BadRequestException('Số lượng phải lớn hơn 0'));

      // Act & Assert
      await expect(controller.buyNow(userId, buyNowDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      // Arrange
      jest.spyOn(service, 'findAll').mockResolvedValue(mockOrders);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrders);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findMyOrders', () => {
    it('should return orders for current user', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      jest.spyOn(service, 'findByUser').mockResolvedValue(mockOrders);

      // Act
      const result = await controller.findMyOrders(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrders);
      expect(service.findByUser).toHaveBeenCalledWith(userId.toString());
    });
  });

  describe('findSuccessOrders', () => {
    it('should return success orders for current user', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439012';
      jest.spyOn(service, 'findSuccessOrders').mockResolvedValue(mockOrders);

      // Act
      const result = await controller.findSuccessOrders(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrders);
      expect(service.findSuccessOrders).toHaveBeenCalledWith(userId.toString());
    });
  });

  describe('findOne', () => {
    it('should return order by id', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder);

      // Act
      const result = await controller.findOne(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrder);
      expect(service.findOne).toHaveBeenCalledWith(orderId);
    });

    it('should handle order not found', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Order not found'));

      // Act & Assert
      await expect(controller.findOne(orderId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update order status successfully', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';
      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.COMPLETED,
      };

      const updatedOrder = { ...mockOrder, status: OrderStatus.COMPLETED };
      jest.spyOn(service, 'updateStatus').mockResolvedValue(updatedOrder);

      // Act
      const result = await controller.update(orderId, userId, updateOrderDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.COMPLETED);
      expect(service.updateStatus).toHaveBeenCalledWith(orderId, updateOrderDto.status);
    });

    it('should handle update errors', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const userId = '507f1f77bcf86cd799439012';
      const updateOrderDto: UpdateOrderDto = {
        status: OrderStatus.COMPLETED,
      };

      jest.spyOn(service, 'updateStatus').mockRejectedValue(new NotFoundException('Order not found'));

      // Act & Assert
      await expect(controller.update(orderId, userId, updateOrderDto))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete order successfully', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'remove').mockResolvedValue(mockOrder);

      // Act
      const result = await controller.remove(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrder);
      expect(service.remove).toHaveBeenCalledWith(orderId);
    });

    it('should handle delete errors', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException('Order not found'));

      // Act & Assert
      await expect(controller.remove(orderId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('getOrderItems', () => {
    it('should return order items successfully', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const mockOrderItems = [
        {
          id: '507f1f77bcf86cd799439014',
          product: mockOrder.items[0].product_snapshot,
          quantity: 2,
          discount_precent: 10,
          old_price: 100000,
          price: 90000,
          subtotal: 180000
        }
      ];

      jest.spyOn(service, 'findOne').mockResolvedValue(mockOrder);
      jest.spyOn(service, 'getOrderItems').mockResolvedValue(mockOrderItems);

      // Act
      const result = await controller.getOrderItems(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrderItems);
      expect(service.findOne).toHaveBeenCalledWith(orderId);
      expect(service.getOrderItems).toHaveBeenCalledWith(orderId);
    });

    it('should handle order not found', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Order not found'));

      // Act & Assert
      await expect(controller.getOrderItems(orderId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('getMyOrders', () => {
    it('should return orders for authenticated user', async () => {
      // Arrange
      const user = { _id: '507f1f77bcf86cd799439012' };
      jest.spyOn(service, 'findByUser').mockResolvedValue(mockOrders);

      // Act
      const result = await controller.getMyOrders(user);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockOrders);
      expect(service.findByUser).toHaveBeenCalledWith(user._id);
    });

    it('should handle unauthorized user', async () => {
      // Arrange
      const user = null;
      jest.spyOn(service, 'findByUser').mockResolvedValue([]);

      // Act & Assert
      await expect(controller.getMyOrders(user))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should handle user without _id', async () => {
      // Arrange
      const user = { name: 'Test User' };
      jest.spyOn(service, 'findByUser').mockResolvedValue([]);

      // Act & Assert
      await expect(controller.getMyOrders(user))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const status = OrderStatus.COMPLETED;
      const updatedOrder = { ...mockOrder, status };

      jest.spyOn(service, 'updateStatus').mockResolvedValue(updatedOrder);

      // Act
      const result = await controller.updateStatus(orderId, status);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.COMPLETED);
      expect(service.updateStatus).toHaveBeenCalledWith(orderId, status);
    });

    it('should handle update status errors', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const status = OrderStatus.COMPLETED;

      jest.spyOn(service, 'updateStatus').mockRejectedValue(new NotFoundException('Order not found'));

      // Act & Assert
      await expect(controller.updateStatus(orderId, status))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('Admin Order Management', () => {
    it('should allow admin to view all orders with different statuses', async () => {
      // Arrange
      const mockOrdersWithDifferentStatuses = [
        { ...mockOrder, status: OrderStatus.PENDING },
        { ...mockOrder, _id: '507f1f77bcf86cd799439020', status: OrderStatus.PROCESSING },
        { ...mockOrder, _id: '507f1f77bcf86cd799439021', status: OrderStatus.COMPLETED },
        { ...mockOrder, _id: '507f1f77bcf86cd799439022', status: OrderStatus.CANCELLED },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(mockOrdersWithDifferentStatuses);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(4);
      expect(result[0].status).toBe(OrderStatus.PENDING);
      expect(result[1].status).toBe(OrderStatus.PROCESSING);
      expect(result[2].status).toBe(OrderStatus.COMPLETED);
      expect(result[3].status).toBe(OrderStatus.CANCELLED);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should allow admin to update order status through multiple steps', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const processingOrder = { ...mockOrder, status: OrderStatus.PROCESSING };
      const completedOrder = { ...mockOrder, status: OrderStatus.COMPLETED };

      jest.spyOn(service, 'updateStatus')
        .mockResolvedValueOnce(processingOrder)
        .mockResolvedValueOnce(completedOrder);

      // Act
      const step1Result = await controller.updateStatus(orderId, OrderStatus.PROCESSING);
      const step2Result = await controller.updateStatus(orderId, OrderStatus.COMPLETED);

      // Assert
      expect(step1Result.status).toBe(OrderStatus.PROCESSING);
      expect(step2Result.status).toBe(OrderStatus.COMPLETED);
      expect(service.updateStatus).toHaveBeenCalledTimes(2);
      expect(service.updateStatus).toHaveBeenNthCalledWith(1, orderId, OrderStatus.PROCESSING);
      expect(service.updateStatus).toHaveBeenNthCalledWith(2, orderId, OrderStatus.COMPLETED);
    });

    it('should allow admin to view order details with payment information', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const orderWithPayment = {
        ...mockOrder,
        id_payment: '507f1f77bcf86cd799439013',
        status: OrderStatus.COMPLETED,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(orderWithPayment);

      // Act
      const result = await controller.findOne(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id_payment).toBe('507f1f77bcf86cd799439013');
      expect(result.status).toBe(OrderStatus.COMPLETED);
      expect(service.findOne).toHaveBeenCalledWith(orderId);
    });

    it('should allow admin to delete orders', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const deletedOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

      jest.spyOn(service, 'remove').mockResolvedValue(deletedOrder);

      // Act
      const result = await controller.remove(orderId);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(OrderStatus.CANCELLED);
      expect(service.remove).toHaveBeenCalledWith(orderId);
    });

    it('should handle admin operations with proper error handling', async () => {
      // Arrange
      const orderId = '507f1f77bcf86cd799439011';
      const invalidStatus = 'INVALID_STATUS';

      jest.spyOn(service, 'updateStatus').mockRejectedValue(new Error('Invalid status transition'));

      // Act & Assert
      await expect(controller.updateStatus(orderId, invalidStatus))
        .rejects
        .toThrow('Invalid status transition');
    });
  });
});
