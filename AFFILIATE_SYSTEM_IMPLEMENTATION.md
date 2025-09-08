# 🚀 Hệ Thống Affiliate - Triển Khai Thực Tế

## 📋 Tổng Quan Dự Án

Dự án **NhatTin Backend** đã có sẵn:
- ✅ **NestJS v11** + **MongoDB** + **Mongoose**
- ✅ **JWT Authentication** system
- ✅ **Users Module** với user management
- ✅ **Orders Module** với order processing
- ✅ **QR Code Payment** (quét mã có sẵn)
- ✅ **Products & Categories** system
- ✅ **File Upload** với Cloudinary
- ✅ **Swagger API** documentation

## 🎯 Mục Tiêu Triển Khai

Tích hợp hệ thống affiliate vào dự án hiện tại mà **KHÔNG làm ảnh hưởng** đến business logic đang hoạt động.

## 🗄️ Database Schema Design

### 1. Mở Rộng User Schema (Hiện Có)

```typescript
// src/users/users.schema.ts - Mở rộng
@Schema({ timestamps: true })
export class User {
  // ... existing fields
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  jwt: string[];
  role: string;
  isDelete: string;
  image: string;
  
  // 🔥 NEW: Affiliate fields
  @Prop({ type: String, unique: true, sparse: true, index: true })
  affiliateCode?: string;
  
  @Prop({ type: Boolean, default: false, index: true })
  isAffiliate?: boolean;
  
  @Prop({ type: String, index: true })
  referredBy?: string;
  
  @Prop({ type: Date })
  affiliateJoinDate?: Date;
}
```

### 2. Mở Rộng Order Schema (Hiện Có)

```typescript
// src/orders/schemas/order.schema.ts - Mở rộng
@Schema({ timestamps: true })
export class Order {
  // ... existing fields
  uid: Types.ObjectId;
  id_payment?: Types.ObjectId;
  note: string;
  voucher?: string;
  status: OrderStatus;
  total_items: number;
  items: Types.ObjectId[];
  
  // 🔥 NEW: Affiliate fields
  @Prop({ type: String, index: true })
  affiliateCode?: string;
  
  @Prop({ type: Number, default: 0 })
  commissionAmount?: number;
  
  @Prop({ type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' })
  commissionStatus?: string;
  
  @Prop({ type: Date })
  commissionPaidDate?: Date;
}
```

### 3. Schema Mới: Affiliate

```typescript
// src/affiliate/schemas/affiliate.schema.ts
@Schema({ timestamps: true })
export class Affiliate {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: mongoose.Types.ObjectId;
  
  @Prop({ type: String, required: true, unique: true, index: true })
  affiliateCode: string;
  
  @Prop({ type: Number, required: true, min: 1, max: 20, default: 8 })
  commissionRate: number;
  
  @Prop({ type: Number, default: 0, min: 0 })
  totalEarnings: number;
  
  @Prop({ type: Number, default: 0, min: 0 })
  totalReferrals: number;
  
  @Prop({ type: Number, default: 0, min: 0 })
  approvedReferrals: number;
  
  @Prop({ type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' })
  status: string;
  
  @Prop({
    type: {
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountHolder: { type: String, required: true },
      bankCode: { type: String, required: false }
    }
  })
  paymentInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    bankCode?: string;
  };
  
  @Prop({ type: Number, default: 100000, min: 50000 })
  minPayoutAmount: number;
  
  @Prop({ type: Date })
  lastPayoutDate?: Date;
  
  @Prop({ type: String })
  notes?: string;
}
```

### 4. Schema Mới: Referral

```typescript
// src/affiliate/schemas/referral.schema.ts
@Schema({ timestamps: true })
export class Referral {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true, index: true })
  affiliateId: mongoose.Types.ObjectId;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true })
  referredUserId: mongoose.Types.ObjectId;
  
  @Prop({ type: String, required: true, index: true })
  referredUserEmail: string;
  
  @Prop({ type: String, required: true, index: true })
  referredUserPhone: string;
  
  @Prop({ type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' })
  status: string;
  
  @Prop({ type: Number, default: 0, min: 0 })
  commissionEarned: number;
  
  @Prop({ type: Date })
  approvedDate?: Date;
  
  @Prop({ type: Date })
  conversionDate?: Date;
  
  @Prop({ type: Number, default: 0, min: 0 })
  totalOrderValue: number;
  
  @Prop({ type: Number, default: 0, min: 0 })
  totalOrders: number;
  
  @Prop({ type: String })
  notes?: string;
  
  @Prop({ type: String })
  rejectionReason?: string;
}
```

### 5. Schema Mới: Commission Transaction

```typescript
// src/affiliate/schemas/commission.schema.ts
@Schema({ timestamps: true })
export class CommissionTransaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate', required: true, index: true })
  affiliateId: mongoose.Types.ObjectId;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: mongoose.Types.ObjectId;
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Referral', required: true, index: true })
  referralId: mongoose.Types.ObjectId;
  
  @Prop({ type: Number, required: true, min: 0 })
  orderAmount: number;
  
  @Prop({ type: Number, required: true, min: 0 })
  commission: number;
  
  @Prop({ type: Number, required: true, min: 0 })
  commissionRate: number;
  
  @Prop({ type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' })
  status: string;
  
  @Prop({ type: Date })
  paidDate?: Date;
  
  @Prop({ type: String, enum: ['QR_CODE', 'BANK_TRANSFER', 'WALLET', 'CASH'] })
  paymentMethod?: string;
  
  @Prop({ type: String })
  paymentReference?: string;
  
  @Prop({ type: String })
  notes?: string;
}
```

## 🔌 Module Structure

### 1. Affiliate Module

```typescript
// src/affiliate/affiliate.module.ts
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Affiliate.name, schema: AffiliateSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: CommissionTransaction.name, schema: CommissionSchema }
    ]),
    UsersModule,
    OrdersModule
  ],
  controllers: [AffiliateController],
  providers: [
    AffiliateService, 
    AffiliateRepo,
    ReferralService,
    CommissionService
  ],
  exports: [AffiliateService, ReferralService, CommissionService]
})
export class AffiliateModule {}
```

### 2. Tích Hợp Vào App Module

```typescript
// src/app.module.ts - Thêm vào imports
@Module({
  imports: [
    // ... existing modules
    AuthModule,
    UsersModule,
    DiscountModule,
    ProductsModule,
    WarehousesModule,
    CartsModule,
    OrdersModule,
    PaymentModule,
    InventoryModule,
    InventoryLogsModule,
    CategoryModule,
    ImageModule,
    NavigationModule,
    PagesModule,
    CategoriesModule,
    SubscriptionTypesModule,
    SubscriptionDurationsModule,
    SubscriptionsModule,
    PostsModule,
    PostCategoriesModule,
    
    // 🔥 NEW: Affiliate Module
    AffiliateModule
  ],
  // ... rest of configuration
})
export class AppModule {}
```

## 🚀 API Endpoints

### 1. Affiliate Management

#### Đăng ký làm affiliate
```http
POST /affiliates/register
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "commissionRate": 8,
  "paymentInfo": {
    "bankName": "Vietcombank",
    "accountNumber": "1234567890",
    "accountHolder": "Nguyễn Văn A"
  }
}

Response: {
  "success": true,
  "data": {
    "affiliateCode": "USER123ABC456",
    "commissionRate": 8,
    "status": "ACTIVE",
    "minPayoutAmount": 100000
  }
}
```

#### Lấy thông tin affiliate profile
```http
GET /affiliates/profile
Authorization: Bearer <jwt_token>

Response: {
  "success": true,
  "data": {
    "affiliateCode": "USER123ABC456",
    "commissionRate": 8,
    "totalEarnings": 1500000,
    "totalReferrals": 25,
    "approvedReferrals": 20,
    "status": "ACTIVE",
    "paymentInfo": {...}
  }
}
```

#### Cập nhật thông tin affiliate
```http
PUT /affiliates/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "commissionRate": 10,
  "paymentInfo": {
    "bankName": "Techcombank",
    "accountNumber": "0987654321",
    "accountHolder": "Nguyễn Văn A"
  }
}
```

### 2. Referral System

#### Tạo referral khi user đăng ký
```http
POST /referrals/create
Content-Type: application/json

{
  "affiliateCode": "USER123ABC456",
  "userData": {
    "fullName": "Nguyễn Văn B",
    "phone": "0987654321",
    "email": "newuser@example.com"
  }
}

Response: {
  "success": true,
  "data": {
    "referralId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "status": "PENDING",
    "commissionEarned": 0
  }
}
```

#### Lấy danh sách referrals của affiliate
```http
GET /referrals/my-referrals
Authorization: Bearer <jwt_token>
Query: ?page=1&limit=10&status=APPROVED

Response: {
  "success": true,
  "data": {
    "referrals": [
      {
        "referredUserEmail": "user1@example.com",
        "status": "APPROVED",
        "commissionEarned": 50000,
        "totalOrderValue": 500000,
        "totalOrders": 3,
        "referralDate": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 3. Commission & Earnings

#### Lấy dashboard affiliate
```http
GET /affiliates/dashboard
Authorization: Bearer <jwt_token>

Response: {
  "success": true,
  "data": {
    "totalEarnings": 1500000,
    "totalReferrals": 25,
    "approvedReferrals": 20,
    "pendingReferrals": 5,
    "monthlyStats": [
      {
        "month": "2024-01",
        "earnings": 500000,
        "referrals": 8,
        "orders": 15
      }
    ],
    "recentTransactions": [...],
    "nextPayoutDate": "2024-02-20T00:00:00Z",
    "qrPaymentStats": {
      "totalQRPayments": 45,
      "totalQRCommission": 1200000
    }
  }
}
```

#### Lấy lịch sử commission
```http
GET /commissions/history
Authorization: Bearer <jwt_token>
Query: ?page=1&limit=10&status=PAID

Response: {
  "success": true,
  "data": {
    "transactions": [
      {
        "orderId": "64f8a1b2c3d4e5f6a7b8c9d2",
        "orderAmount": 500000,
        "commission": 40000,
        "commissionRate": 8,
        "status": "PAID",
        "transactionDate": "2024-01-15T10:30:00Z",
        "paidDate": "2024-01-20T15:00:00Z"
      }
    ]
  }
}
```

## 🔧 Business Logic Implementation

### 1. Affiliate Code Generation

```typescript
// src/affiliate/services/affiliate.service.ts
@Injectable()
export class AffiliateService {
  private generateAffiliateCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const userSuffix = userId.substr(-4);
    
    return `${userSuffix}${timestamp}${random}`.toUpperCase();
  }
  
  async createAffiliate(userId: string, createAffiliateDto: CreateAffiliateDto) {
    const affiliateCode = this.generateAffiliateCode(userId);
    
    const affiliate = await this.affiliateRepo.create({
      userId: new mongoose.Types.ObjectId(userId),
      affiliateCode,
      commissionRate: createAffiliateDto.commissionRate,
      paymentInfo: createAffiliateDto.paymentInfo,
      status: 'ACTIVE',
      affiliateJoinDate: new Date()
    });
    
    // Cập nhật user
    await this.usersService.updateUser(userId, {
      isAffiliate: true,
      affiliateCode
    });
    
    return affiliate;
  }
}
```

### 2. Commission Calculation

```typescript
// src/affiliate/services/commission.service.ts
@Injectable()
export class CommissionService {
  async calculateCommission(orderId: string, userId: string) {
    const order = await this.ordersService.findById(orderId);
    const user = await this.usersService.findById(userId);
    
    if (!user.referredBy) return null;
    
    const affiliate = await this.affiliateRepo.findByCode(user.referredBy);
    if (!affiliate || affiliate.status !== 'ACTIVE') return null;
    
    const commission = this.calculateCommissionAmount(
      order.total_items, 
      affiliate.commissionRate
    );
    
    const commissionTransaction = await this.commissionRepo.create({
      affiliateId: affiliate._id,
      orderId: order._id,
      referralId: user.referredBy,
      orderAmount: order.total_items,
      commission,
      commissionRate: affiliate.commissionRate,
      status: 'PENDING'
    });
    
    // Cập nhật tổng earnings của affiliate
    await this.affiliateRepo.updateEarnings(affiliate._id, commission);
    
    return commissionTransaction;
  }
  
  private calculateCommissionAmount(orderAmount: number, rate: number): number {
    const commission = (orderAmount * rate) / 100;
    return Math.round(commission / 1000) * 1000; // Làm tròn đến 1000
  }
}
```

### 3. Referral Processing

```typescript
// src/affiliate/services/referral.service.ts
@Injectable()
export class ReferralService {
  async createReferral(createReferralDto: CreateReferralDto) {
    const { affiliateCode, userData } = createReferralDto;
    
    // Kiểm tra affiliate code hợp lệ
    const affiliate = await this.affiliateRepo.findByCode(affiliateCode);
    if (!affiliate || affiliate.status !== 'ACTIVE') {
      throw new BadRequestException('Affiliate code không hợp lệ');
    }
    
    // Kiểm tra user chưa được refer trước đó
    const existingReferral = await this.referralRepo.findByEmail(userData.email);
    if (existingReferral) {
      throw new BadRequestException('Email này đã được giới thiệu trước đó');
    }
    
    // Kiểm tra không tự refer chính mình
    if (affiliate.userId.toString() === userData.email) {
      throw new BadRequestException('Không thể tự giới thiệu chính mình');
    }
    
    // Tạo referral
    const referral = await this.referralRepo.create({
      affiliateId: affiliate._id,
      referredUserEmail: userData.email,
      referredUserPhone: userData.phone,
      status: 'PENDING',
      commissionEarned: 0
    });
    
    // Cập nhật số lượng referrals của affiliate
    await this.affiliateRepo.incrementReferrals(affiliate._id);
    
    return referral;
  }
}
```

## 🔄 QR Code Payment Integration

### 1. Tích Hợp Với QR Payment Hiện Tại

```typescript
// src/orders/orders.service.ts - Mở rộng
@Injectable()
export class OrdersService {
  // ... existing methods
  
  async processQRCodePayment(orderId: string, qrData: any) {
    try {
      // Xử lý thanh toán QR code hiện tại
      const paymentResult = await this.processExistingQRPayment(qrData);
      
      if (paymentResult.success) {
        // Cập nhật trạng thái order
        const updatedOrder = await this.ordersRepo.updateStatus(orderId, 'COMPLETED');
        
        // 🔥 NEW: Xử lý affiliate commission
        if (updatedOrder.affiliateCode) {
          await this.affiliateService.processCommissionAfterPayment(updatedOrder);
        }
        
        return { success: true, message: 'Thanh toán thành công' };
      }
      
      return paymentResult;
    } catch (error) {
      throw new BadRequestException('Xử lý thanh toán thất bại');
    }
  }
  
  private async processExistingQRPayment(qrData: any) {
    // Logic xử lý QR code hiện tại của dự án
    // ... existing QR payment logic
    return { success: true };
  }
}
```

### 2. Commission Processing Sau QR Payment

```typescript
// src/affiliate/services/commission.service.ts - Mở rộng
@Injectable()
export class CommissionService {
  // ... existing methods
  
  async processCommissionAfterPayment(order: any) {
    try {
      // Kiểm tra order có affiliate code không
      if (!order.affiliateCode) return null;
      
      // Tìm affiliate
      const affiliate = await this.affiliateRepo.findByCode(order.affiliateCode);
      if (!affiliate || affiliate.status !== 'ACTIVE') return null;
      
      // Tính commission
      const commission = this.calculateCommissionAmount(
        order.total_items, 
        affiliate.commissionRate
      );
      
      // Tạo commission transaction
      const commissionTransaction = await this.commissionRepo.create({
        affiliateId: affiliate._id,
        orderId: order._id,
        referralId: order.uid, // User ID của người mua
        orderAmount: order.total_items,
        commission,
        commissionRate: affiliate.commissionRate,
        status: 'PENDING',
        paymentMethod: 'QR_CODE'
      });
      
      // Cập nhật tổng earnings của affiliate
      await this.affiliateRepo.updateEarnings(affiliate._id, commission);
      
      // Cập nhật order với commission info
      await this.ordersRepo.updateOrder(order._id, {
        commissionAmount: commission,
        commissionStatus: 'PENDING'
      });
      
      return commissionTransaction;
    } catch (error) {
      console.error('Error processing commission after payment:', error);
      return null;
    }
  }
}
```

### 3. QR Payment Flow Với Affiliate

```typescript
// Flow xử lý:
// 1. User tạo order với affiliate code
// 2. User quét QR code để thanh toán
// 3. QR payment được xử lý
// 4. Order status chuyển thành COMPLETED
// 5. Tự động tính và tạo commission cho affiliate
// 6. Affiliate nhận được thông báo commission mới
```

## 🔐 Security & Validation

### 1. Rate Limiting

```typescript
// src/affiliate/affiliate.controller.ts
@Controller('affiliates')
export class AffiliateController {
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests/phút
  async registerAffiliate(@Body() createAffiliateDto: CreateAffiliateDto, @User('id') userId: string) {
    return this.affiliateService.createAffiliate(userId, createAffiliateDto);
  }
}
```

### 2. Fraud Prevention

```typescript
// src/affiliate/guards/fraud-prevention.guard.ts
@Injectable()
export class FraudPreventionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const affiliateId = request.user?.id;
    
    if (!affiliateId) return true;
    
    // Kiểm tra số lượng referrals trong 24h
    const recentReferrals = await this.referralService.countRecentReferrals(
      affiliateId, 
      24 * 60 * 60 * 1000
    );
    
    if (recentReferrals > 10) {
      throw new BadRequestException('Quá nhiều referrals trong 24h, vui lòng thử lại sau');
    }
    
    return true;
  }
}
```

## 📊 Integration Points

### 1. Tích Hợp Với User Registration

```typescript
// src/users/users.service.ts - Mở rộng
@Injectable()
export class UsersService {
  async createUser(createUserDto: CreateUserDto) {
    // ... existing user creation logic
    
    // 🔥 NEW: Xử lý affiliate referral
    if (createUserDto.affiliateCode) {
      await this.affiliateService.processReferral(
        createUserDto.affiliateCode,
        user._id,
        createUserDto
      );
    }
    
    return user;
  }
}
```

### 2. Tích Hợp Với Order Processing

```typescript
// src/orders/orders.service.ts - Mở rộng
@Injectable()
export class OrdersService {
  async createOrder(createOrderDto: CreateOrderDto) {
    // ... existing order creation logic
    
    // 🔥 NEW: Xử lý commission
    if (order.affiliateCode) {
      await this.affiliateService.processCommission(order);
    }
    
    return order;
  }
  
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.ordersRepo.updateStatus(orderId, status);
    
    // 🔥 NEW: Xử lý commission khi order hoàn thành
    if (status === OrderStatus.COMPLETED && order.affiliateCode) {
      await this.affiliateService.approveCommission(order);
    }
    
    return order;
  }
}
```

### 3. Tích Hợp Với QR Code Payment

```typescript
// src/orders/orders.service.ts - Mở rộng thêm
@Injectable()
export class OrdersService {
  async processQRPayment(orderId: string, qrPaymentData: any) {
    // ... existing QR payment logic
    
    // 🔥 NEW: Xử lý affiliate commission sau khi thanh toán thành công
    const order = await this.ordersRepo.findById(orderId);
    if (order.affiliateCode && order.status === 'COMPLETED') {
      await this.affiliateService.processCommissionAfterPayment(order);
    }
    
    return { success: true, message: 'Thanh toán thành công' };
  }
}
```

## 🚀 Deployment Steps

### Phase 1: Database Migration
```bash
# 1. Backup database hiện tại
mongodump --db nhattin_db --out ./backup

# 2. Tạo migration script
npm run migration:affiliate

# 3. Verify data integrity
npm run test:affiliate
```

### Phase 2: Module Integration
```bash
# 1. Install dependencies (nếu cần)
npm install @nestjs/throttler

# 2. Tích hợp với QR payment system hiện tại
# - Mở rộng OrdersService để xử lý affiliate commission
# - Cập nhật QR payment flow

# 3. Build project
npm run build

# 4. Test integration
npm run test:e2e
```

### Phase 3: Production Deployment
```bash
# 1. Environment variables
AFFILIATE_ENABLED=true
AFFILIATE_COMMISSION_RATE=8
AFFILIATE_MIN_PAYOUT=100000

# 2. Deploy
npm run start:prod
```

## 📝 Testing Strategy

### 1. Unit Tests
```typescript
// src/affiliate/affiliate.service.spec.ts
describe('AffiliateService', () => {
  test('should generate unique affiliate code', () => {
    const code1 = service.generateAffiliateCode('user123');
    const code2 = service.generateAffiliateCode('user123');
    expect(code1).not.toBe(code2);
  });
  
  test('should calculate commission correctly', () => {
    const commission = service.calculateCommission(1000000, 8);
    expect(commission).toBe(80000);
  });
});
```

### 2. Integration Tests
```typescript
// test/affiliate.e2e-spec.ts
describe('Affiliate System (e2e)', () => {
  test('should create affiliate account', async () => {
    const response = await request(app)
      .post('/affiliates/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ commissionRate: 8 });
    
    expect(response.status).toBe(201);
    expect(response.body.data.affiliateCode).toBeDefined();
  });
});
```

## 🎯 Kết Luận

### ✅ Lợi Ích Triển Khai:
1. **Tích hợp mượt mà** với hệ thống hiện có
2. **Không ảnh hưởng** đến business logic đang hoạt động
3. **Tận dụng QR payment system** hiện tại
4. **Mở rộng dễ dàng** cho tương lai
5. **Tận dụng được** infrastructure hiện có

### 📊 KPI Dự Kiến:
- **Thời gian triển khai**: 2-3 tuần
- **Tỷ lệ thành công**: 95%+
- **Performance impact**: <5%
- **ROI**: Cao (tăng doanh thu từ affiliate)

### 🚀 Next Steps:
1. **Review & Approval** từ team
2. **Database migration** planning
3. **Development** theo phases
4. **Testing & QA** 
5. **Production deployment**

---

**Hệ thống Affiliate hoàn toàn phù hợp và có thể triển khai thành công vào dự án NhatTin Backend! 🎉**
