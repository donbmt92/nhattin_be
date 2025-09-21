# 🎯 Frontend Implementation Guide

## Tổng quan
Hướng dẫn này mô tả cách frontend cần implement để đảm bảo các test cases trong `complete-flow-admin.spec.ts` có thể PASS thành công.

## 📋 Mục lục
1. [API Integration Requirements](#api-integration-requirements)
2. [Order Management](#order-management)
3. [Payment Integration](#payment-integration)
4. [Admin Dashboard](#admin-dashboard)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Authentication & Authorization](#authentication--authorization)
8. [UI Components](#ui-components)

---

## 🔌 API Integration Requirements

### Required Endpoints

```typescript
// Order Management APIs
const ORDER_ENDPOINTS = {
  CREATE_ORDER: 'POST /api/orders',
  UPDATE_ORDER_STATUS: 'PUT /api/orders/:id/status',
  GET_ORDERS: 'GET /api/orders',
  GET_ORDER_DETAIL: 'GET /api/orders/:id',
  ADMIN_UPDATE_ORDER: 'PUT /api/admin/orders/:id/status',
};

// Payment Management APIs
const PAYMENT_ENDPOINTS = {
  CREATE_PAYMENT: 'POST /api/payments',
  UPDATE_PAYMENT: 'PUT /api/payments/:id',
  ADMIN_APPROVE_PAYMENT: 'PUT /api/admin/payments/:id',
  BANK_TRANSFER: 'PUT /api/admin/payments/:id/bank-transfer',
  GET_PAYMENTS: 'GET /api/admin/payments',
};

// Affiliate Management APIs
const AFFILIATE_ENDPOINTS = {
  PROCESS_COMMISSION: 'POST /api/affiliate/process-commission',
  GET_AFFILIATE_DATA: 'GET /api/affiliate/:code',
};
```

### API Service Implementation

```typescript
// services/api.service.ts
export class ApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const response = await fetch(`${this.baseURL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const response = await fetch(`${this.baseURL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async createPayment(paymentData: CreatePaymentDto): Promise<PaymentDetail> {
    const response = await fetch(`${this.baseURL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create payment: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async updatePayment(paymentId: string, updateData: any): Promise<PaymentDetail> {
    const response = await fetch(`${this.baseURL}/api/payments/${paymentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update payment: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  private getToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}
```

---

## 🛒 Order Management

### Order Creation Flow

```typescript
// components/OrderCreation.tsx
import React, { useState } from 'react';
import { ApiService } from '../services/api.service';

interface OrderCreationProps {
  cartItems: CartItem[];
  userId: string;
  affiliateCode?: string;
}

export const OrderCreation: React.FC<OrderCreationProps> = ({
  cartItems,
  userId,
  affiliateCode
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('PENDING');
  
  const createOrder = async () => {
    setIsLoading(true);
    try {
      // 1. Tạo đơn hàng
      const orderData = {
        uid: userId,
        items: cartItems.map(item => ({
          id_product: item.productId,
          quantity: item.quantity
        })),
        affiliateCode: affiliateCode,
        note: 'Order created from frontend'
      };
      
      const order = await ApiService.createOrder(orderData);
      setOrderStatus(order.status);
      
      // 2. Tạo thanh toán
      const paymentData = {
        id_order: order._id,
        provider: 'VNPay',
        amount: order.total_amount,
        is_bank_transfer: false
      };
      
      const payment = await ApiService.createPayment(paymentData);
      
      // 3. Redirect to payment gateway
      if (payment.gateway_url) {
        window.location.href = payment.gateway_url;
      }
      
    } catch (error) {
      console.error('Order creation failed:', error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="order-creation">
      <h2>Create Order</h2>
      <div className="order-status">
        Status: <span className={`status-${orderStatus.toLowerCase()}`}>{orderStatus}</span>
      </div>
      
      <button 
        onClick={createOrder} 
        disabled={isLoading}
        className="create-order-btn"
      >
        {isLoading ? 'Creating Order...' : 'Create Order'}
      </button>
    </div>
  );
};
```

### Order Status Management

```typescript
// hooks/useOrderStatus.ts
import { useState, useEffect } from 'react';
import { ApiService } from '../services/api.service';

export const useOrderStatus = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [isLoading, setIsLoading] = useState(false);
  
  const updateOrderStatus = async (newStatus: OrderStatus) => {
    setIsLoading(true);
    try {
      const updatedOrder = await ApiService.updateOrderStatus(orderId, newStatus);
      setOrder(updatedOrder);
      setStatus(updatedOrder.status);
      
      // Handle status-specific actions
      if (newStatus === 'COMPLETED') {
        await clearCart();
        await processAffiliateCommission();
      } else if (newStatus === 'CANCELLED') {
        await handleOrderCancellation();
      }
      
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const syncOrderStatus = async () => {
    try {
      const orderData = await ApiService.getOrderDetail(orderId);
      setOrder(orderData);
      setStatus(orderData.status);
    } catch (error) {
      console.error('Failed to sync order status:', error);
    }
  };
  
  useEffect(() => {
    if (orderId) {
      syncOrderStatus();
    }
  }, [orderId]);
  
  return {
    order,
    status,
    isLoading,
    updateOrderStatus,
    syncOrderStatus
  };
};
```

---

## 💳 Payment Integration

### Payment Processing Component

```typescript
// components/PaymentProcessing.tsx
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api.service';

interface PaymentProcessingProps {
  paymentId: string;
  orderId: string;
  amount: number;
}

export const PaymentProcessing: React.FC<PaymentProcessingProps> = ({
  paymentId,
  orderId,
  amount
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const processPayment = async (paymentMethod: string) => {
    setIsProcessing(true);
    try {
      const updateData = {
        provider: paymentMethod,
        status: 'PROCESSING'
      };
      
      const payment = await ApiService.updatePayment(paymentId, updateData);
      setPaymentStatus(payment.status);
      
      // Handle different payment methods
      if (paymentMethod === 'VNPay') {
        // Redirect to VNPay gateway
        window.location.href = payment.gateway_url;
      } else if (paymentMethod === 'BANK_TRANSFER') {
        // Show bank transfer instructions
        showBankTransferInstructions();
      }
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      // Handle payment failure
      await handlePaymentFailure();
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePaymentSuccess = async () => {
    try {
      const updateData = {
        status: 'COMPLETED',
        transaction_reference: generateTransactionRef()
      };
      
      const payment = await ApiService.updatePayment(paymentId, updateData);
      setPaymentStatus(payment.status);
      
      // Update order status to COMPLETED
      await ApiService.updateOrderStatus(orderId, 'COMPLETED');
      
      // Process affiliate commission
      await processAffiliateCommission();
      
    } catch (error) {
      console.error('Payment success handling failed:', error);
    }
  };
  
  const handlePaymentFailure = async () => {
    try {
      const updateData = {
        status: 'FAILED',
        transaction_reference: 'FAILED_' + Date.now()
      };
      
      const payment = await ApiService.updatePayment(paymentId, updateData);
      setPaymentStatus(payment.status);
      
      // Cancel order
      await ApiService.updateOrderStatus(orderId, 'CANCELLED');
      
    } catch (error) {
      console.error('Payment failure handling failed:', error);
    }
  };
  
  return (
    <div className="payment-processing">
      <h2>Payment Processing</h2>
      <div className="payment-info">
        <p>Amount: {amount.toLocaleString()} VND</p>
        <p>Status: <span className={`status-${paymentStatus.toLowerCase()}`}>{paymentStatus}</span></p>
      </div>
      
      <div className="payment-methods">
        <button 
          onClick={() => processPayment('VNPay')}
          disabled={isProcessing}
          className="payment-btn vnpay"
        >
          Pay with VNPay
        </button>
        
        <button 
          onClick={() => processPayment('BANK_TRANSFER')}
          disabled={isProcessing}
          className="payment-btn bank-transfer"
        >
          Bank Transfer
        </button>
      </div>
    </div>
  );
};
```

---

## 👨‍💼 Admin Dashboard

### Admin Order Management

```typescript
// components/admin/AdminOrderManagement.tsx
import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api.service';

export const AdminOrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      
      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map(order => 
          order._id === orderId ? updatedOrder : order
        ));
        
        // Show success message
        showSuccessMessage(`Order ${orderId} status updated to ${status}`);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      showErrorMessage('Failed to update order status');
    }
  };
  
  const handleOrderLifecycle = async (orderId: string) => {
    try {
      // Step 1: Update to PROCESSING
      await updateOrderStatus(orderId, 'PROCESSING');
      
      // Step 2: Approve payment (if exists)
      const order = orders.find(o => o._id === orderId);
      if (order?.id_payment) {
        await approvePayment(order.id_payment);
      }
      
      // Step 3: Complete order
      await updateOrderStatus(orderId, 'COMPLETED');
      
    } catch (error) {
      console.error('Order lifecycle management failed:', error);
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  return (
    <div className="admin-order-management">
      <h2>Admin Order Management</h2>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-item">
            <div className="order-info">
              <h3>Order #{order._id}</h3>
              <p>Status: <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></p>
              <p>Total: {order.total_amount?.toLocaleString()} VND</p>
              <p>Affiliate: {order.affiliateCode || 'None'}</p>
            </div>
            
            <div className="order-actions">
              <button 
                onClick={() => updateOrderStatus(order._id, 'PROCESSING')}
                disabled={order.status === 'PROCESSING'}
              >
                Mark as Processing
              </button>
              
              <button 
                onClick={() => updateOrderStatus(order._id, 'COMPLETED')}
                disabled={order.status === 'COMPLETED'}
              >
                Complete Order
              </button>
              
              <button 
                onClick={() => handleOrderLifecycle(order._id)}
                className="lifecycle-btn"
              >
                Complete Lifecycle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Admin Payment Management

```typescript
// components/admin/AdminPaymentManagement.tsx
import React, { useState, useEffect } from 'react';

export const AdminPaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetail | null>(null);
  
  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      
      if (response.ok) {
        const paymentsData = await response.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };
  
  const approvePayment = async (paymentId: string, transactionRef: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          transaction_reference: transactionRef
        })
      });
      
      if (response.ok) {
        const updatedPayment = await response.json();
        setPayments(payments.map(payment => 
          payment._id === paymentId ? updatedPayment : payment
        ));
        
        showSuccessMessage(`Payment ${paymentId} approved successfully`);
      }
    } catch (error) {
      console.error('Failed to approve payment:', error);
      showErrorMessage('Failed to approve payment');
    }
  };
  
  const handleBankTransfer = async (paymentId: string, transferData: any) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/bank-transfer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          is_bank_transfer: true,
          bank_name: transferData.bankName,
          transfer_date: transferData.transferDate,
          transfer_note: transferData.transferNote,
          status: 'COMPLETED'
        })
      });
      
      if (response.ok) {
        const updatedPayment = await response.json();
        setPayments(payments.map(payment => 
          payment._id === paymentId ? updatedPayment : payment
        ));
        
        showSuccessMessage('Bank transfer approved successfully');
      }
    } catch (error) {
      console.error('Failed to handle bank transfer:', error);
      showErrorMessage('Failed to handle bank transfer');
    }
  };
  
  return (
    <div className="admin-payment-management">
      <h2>Admin Payment Management</h2>
      
      <div className="payments-list">
        {payments.map(payment => (
          <div key={payment._id} className="payment-item">
            <div className="payment-info">
              <h3>Payment #{payment._id}</h3>
              <p>Status: <span className={`status-${payment.status.toLowerCase()}`}>{payment.status}</p>
              <p>Amount: {payment.amount?.toLocaleString()} VND</p>
              <p>Provider: {payment.provider}</p>
              <p>Order: {payment.id_order}</p>
            </div>
            
            <div className="payment-actions">
              <button 
                onClick={() => approvePayment(payment._id, `ADMIN_APPROVED_${Date.now()}`)}
                disabled={payment.status === 'COMPLETED'}
              >
                Approve Payment
              </button>
              
              <button 
                onClick={() => setSelectedPayment(payment)}
                className="bank-transfer-btn"
              >
                Handle Bank Transfer
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Bank Transfer Modal */}
      {selectedPayment && (
        <BankTransferModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onSubmit={handleBankTransfer}
        />
      )}
    </div>
  );
};
```

---

## 🔄 State Management

### Order State Hook

```typescript
// hooks/useOrderState.ts
import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api.service';

export const useOrderState = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const ordersData = await ApiService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      const updatedOrder = await ApiService.updateOrderStatus(orderId, status);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? updatedOrder : order
        )
      );
      
      if (currentOrder?._id === orderId) {
        setCurrentOrder(updatedOrder);
      }
      
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      throw err;
    }
  }, [currentOrder]);
  
  const syncOrderStatus = useCallback(async (orderId: string) => {
    try {
      const orderData = await ApiService.getOrderDetail(orderId);
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? orderData : order
        )
      );
      
      if (currentOrder?._id === orderId) {
        setCurrentOrder(orderData);
      }
      
      return orderData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync order status');
      throw err;
    }
  }, [currentOrder]);
  
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  return {
    orders,
    currentOrder,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    syncOrderStatus,
    setCurrentOrder
  };
};
```

### Payment State Hook

```typescript
// hooks/usePaymentState.ts
import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api.service';

export const usePaymentState = () => {
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [currentPayment, setCurrentPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const paymentsData = await ApiService.getPayments();
      setPayments(paymentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updatePaymentStatus = useCallback(async (paymentId: string, updateData: any) => {
    try {
      const updatedPayment = await ApiService.updatePayment(paymentId, updateData);
      
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment._id === paymentId ? updatedPayment : payment
        )
      );
      
      if (currentPayment?._id === paymentId) {
        setCurrentPayment(updatedPayment);
      }
      
      return updatedPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      throw err;
    }
  }, [currentPayment]);
  
  const handlePaymentStatusChange = useCallback(async (paymentId: string, newStatus: PaymentStatus) => {
    try {
      const updatedPayment = await updatePaymentStatus(paymentId, { status: newStatus });
      
      // Handle status-specific side effects
      if (newStatus === 'COMPLETED') {
        await clearCart();
        await processAffiliateCommission(updatedPayment.id_order);
      } else if (newStatus === 'FAILED') {
        await cancelOrder(updatedPayment.id_order);
      }
      
      return updatedPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to handle payment status change');
      throw err;
    }
  }, [updatePaymentStatus]);
  
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  
  return {
    payments,
    currentPayment,
    isLoading,
    error,
    fetchPayments,
    updatePaymentStatus,
    handlePaymentStatusChange,
    setCurrentPayment
  };
};
```

---

## 🚨 Error Handling

### Error Boundary Component

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);
  }
  
  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Implement error logging
    console.log('Logging error to service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### Error Handling Utilities

```typescript
// utils/errorHandler.ts
export class ErrorHandler {
  static handleApiError(error: any): string {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'Server error';
      
      switch (status) {
        case 400:
          return `Bad Request: ${message}`;
        case 401:
          return 'Unauthorized. Please login again.';
        case 403:
          return 'Forbidden. You do not have permission.';
        case 404:
          return 'Resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `Error ${status}: ${message}`;
      }
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection.';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred.';
    }
  }
  
  static handleOrderError(error: any): void {
    const message = this.handleApiError(error);
    
    // Show user-friendly error message
    showErrorMessage(message);
    
    // Log error for debugging
    console.error('Order error:', error);
    
    // Implement fallback mechanism
    this.fallbackToOfflineMode();
  }
  
  static handlePaymentError(error: any): void {
    const message = this.handleApiError(error);
    
    // Show user-friendly error message
    showErrorMessage(message);
    
    // Log error for debugging
    console.error('Payment error:', error);
    
    // Implement fallback mechanism
    this.fallbackToOfflineMode();
  }
  
  private static fallbackToOfflineMode(): void {
    // Implement offline mode logic
    console.log('Switching to offline mode...');
    
    // Store pending operations
    this.storePendingOperations();
    
    // Show offline indicator
    this.showOfflineIndicator();
  }
  
  private static storePendingOperations(): void {
    // Store operations to retry when online
    const pendingOps = {
      timestamp: Date.now(),
      operations: []
    };
    
    localStorage.setItem('pendingOperations', JSON.stringify(pendingOps));
  }
  
  private static showOfflineIndicator(): void {
    // Show offline indicator in UI
    const indicator = document.createElement('div');
    indicator.className = 'offline-indicator';
    indicator.textContent = 'You are offline. Changes will be synced when online.';
    document.body.appendChild(indicator);
  }
}
```

---

## 🔐 Authentication & Authorization

### Admin Authentication Hook

```typescript
// hooks/useAdminAuth.ts
import { useState, useEffect, useCallback } from 'react';

interface AdminCredentials {
  email: string;
  password: string;
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const loginAsAdmin = useCallback(async (credentials: AdminCredentials) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const { token, user } = await response.json();
        
        setAdminToken(token);
        setAdminUser(user);
        setIsAdmin(true);
        
        // Store token in localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        return { success: true, user };
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const logoutAdmin = useCallback(() => {
    setAdminToken(null);
    setAdminUser(null);
    setIsAdmin(false);
    
    // Clear localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }, []);
  
  const checkAdminAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (token && user) {
      setAdminToken(token);
      setAdminUser(JSON.parse(user));
      setIsAdmin(true);
    }
  }, []);
  
  const getAdminToken = useCallback(() => {
    return adminToken || localStorage.getItem('adminToken');
  }, [adminToken]);
  
  const hasPermission = useCallback((permission: string) => {
    return adminUser?.permissions.includes(permission) || false;
  }, [adminUser]);
  
  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);
  
  return {
    isAdmin,
    adminUser,
    adminToken,
    isLoading,
    loginAsAdmin,
    logoutAdmin,
    getAdminToken,
    hasPermission
  };
};
```

### Admin Route Protection

```typescript
// components/AdminRoute.tsx
import React from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminLogin } from './AdminLogin';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAdmin, hasPermission } = useAdminAuth();
  
  if (!isAdmin) {
    return <AdminLogin />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="admin-unauthorized">
        <h2>Unauthorized</h2>
        <p>You do not have permission to access this resource.</p>
      </div>
    );
  }
  
  return <>{children}</>;
};
```

---

## 🎨 UI Components

### Loading States

```typescript
// components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'Loading...' 
}) => {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className={`loading-spinner ${sizeClass}`}>
      <div className="spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};
```

### Status Indicators

```typescript
// components/StatusIndicator.tsx
import React from 'react';

interface StatusIndicatorProps {
  status: string;
  type: 'order' | 'payment' | 'affiliate';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, type }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-unknown';
    }
  };
  
  return (
    <span className={`status-indicator ${getStatusColor(status)}`}>
      {status.toUpperCase()}
    </span>
  );
};
```

### Success/Error Messages

```typescript
// components/MessageToast.tsx
import React, { useState, useEffect } from 'react';

interface MessageToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const MessageToast: React.FC<MessageToastProps> = ({ 
  message, 
  type, 
  duration = 5000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div className={`message-toast ${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon(type)}</span>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={() => setIsVisible(false)}>
          ×
        </button>
      </div>
    </div>
  );
};

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
    default:
      return 'ℹ';
  }
};
```

---

## 📱 Responsive Design

### Mobile-First Approach

```css
/* styles/responsive.css */
.order-management {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .order-management {
    flex-direction: row;
    gap: 2rem;
  }
}

.payment-methods {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 480px) {
  .payment-methods {
    grid-template-columns: repeat(2, 1fr);
  }
}

.admin-dashboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .admin-dashboard {
    grid-template-columns: 1fr 2fr;
  }
}
```

---

## 🧪 Testing Requirements

### Component Testing

```typescript
// __tests__/OrderCreation.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderCreation } from '../components/OrderCreation';

describe('OrderCreation', () => {
  const mockCartItems = [
    { productId: '1', quantity: 2 },
    { productId: '2', quantity: 1 }
  ];
  
  it('should create order successfully', async () => {
    render(
      <OrderCreation 
        cartItems={mockCartItems}
        userId="user123"
        affiliateCode="AFFILIATE123"
      />
    );
    
    const createButton = screen.getByText('Create Order');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('Creating Order...')).toBeInTheDocument();
    });
  });
});
```

### Integration Testing

```typescript
// __tests__/OrderPaymentFlow.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderCreation } from '../components/OrderCreation';
import { PaymentProcessing } from '../components/PaymentProcessing';

describe('Order Payment Flow', () => {
  it('should complete order-payment flow successfully', async () => {
    render(
      <div>
        <OrderCreation cartItems={[]} userId="user123" />
        <PaymentProcessing paymentId="payment123" orderId="order123" amount={100000} />
      </div>
    );
    
    // Test order creation
    const createButton = screen.getByText('Create Order');
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText('PENDING')).toBeInTheDocument();
    });
    
    // Test payment processing
    const payButton = screen.getByText('Pay with VNPay');
    fireEvent.click(payButton);
    
    await waitFor(() => {
      expect(screen.getByText('PROCESSING')).toBeInTheDocument();
    });
  });
});
```

---

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All API endpoints are properly configured
- [ ] Error handling is implemented
- [ ] Loading states are working
- [ ] Admin authentication is secure
- [ ] Responsive design is tested
- [ ] Unit tests are passing
- [ ] Integration tests are passing

### Post-deployment

- [ ] Monitor API calls
- [ ] Check error logs
- [ ] Verify admin functionality
- [ ] Test payment flows
- [ ] Monitor performance
- [ ] Check user experience

---

## 📞 Support & Maintenance

### Common Issues

1. **API Connection Issues**
   - Check API URL configuration
   - Verify authentication tokens
   - Check network connectivity

2. **Payment Gateway Issues**
   - Verify payment gateway configuration
   - Check transaction references
   - Monitor payment status updates

3. **Admin Access Issues**
   - Verify admin authentication
   - Check user permissions
   - Validate admin tokens

### Monitoring

- Monitor API response times
- Track error rates
- Monitor user interactions
- Check payment success rates
- Monitor admin operations

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

**Lưu ý**: File này cung cấp hướng dẫn chi tiết để frontend implement đúng các tính năng cần thiết. Đảm bảo follow đúng các patterns và best practices để test cases có thể PASS thành công.
