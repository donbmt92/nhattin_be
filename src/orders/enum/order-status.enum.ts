/* eslint-disable prettier/prettier */
export enum OrderStatus {
  PENDING = 'pending',      // Đơn hàng mới tạo
  PROCESSING = 'processing', // Đang xử lý
  COMPLETED = 'completed',   // Hoàn thành
  CANCELLED = 'cancelled',   // Đã hủy
  REFUNDED = 'refunded',    // Đã hoàn tiền
  FAILED = 'failed'         // Thất bại
}

export const OrderStatusDescription = {
  [OrderStatus.PENDING]: 'Đơn hàng mới tạo',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.REFUNDED]: 'Đã hoàn tiền',
  [OrderStatus.FAILED]: 'Thất bại'
};

export const OrderStatusColor = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.PROCESSING]: 'primary',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.CANCELLED]: 'danger',
  [OrderStatus.REFUNDED]: 'info',
  [OrderStatus.FAILED]: 'danger'
};
