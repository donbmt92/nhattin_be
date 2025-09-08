# 🚀 Hệ Thống Affiliate Backend

## 📋 Tổng Quan
Hệ thống affiliate cho phép người dùng kiếm tiền bằng cách giới thiệu khách hàng mới đến website. Backend cần xử lý việc quản lý affiliate, tracking referral, tính toán commission và thanh toán.

## 🗄️ Database Schema

### 1. Bảng `affiliates`
```sql
affiliates {
  _id: ObjectId (Primary Key)
  userId: ObjectId (ref: users) - Người dùng affiliate
  affiliateCode: String (unique) - Mã affiliate duy nhất
  commissionRate: Number (default: 5-10%) - Tỷ lệ hoa hồng
  totalEarnings: Number (default: 0) - Tổng thu nhập
  totalReferrals: Number (default: 0) - Tổng số người được giới thiệu
  status: String (ACTIVE/INACTIVE) - Trạng thái tài khoản
  paymentInfo: {
    bankName: String,
    accountNumber: String,
    accountHolder: String
  }
  createdAt: Date
  updatedAt: Date
}
```

### 2. Bảng `referrals`
```sql
referrals {
  _id: ObjectId (Primary Key)
  affiliateId: ObjectId (ref: affiliates) - ID của affiliate
  referredUserId: ObjectId (ref: users) - Người được giới thiệu
  referredUserEmail: String - Email người được giới thiệu
  status: String (PENDING/APPROVED/REJECTED) - Trạng thái referral
  commissionEarned: Number (default: 0) - Hoa hồng kiếm được
  referralDate: Date - Ngày giới thiệu
  approvedDate: Date - Ngày được duyệt
  conversionDate: Date - Ngày chuyển đổi (mua hàng đầu tiên)
  notes: String - Ghi chú
}
```

### 3. Bảng `commission_transactions`
```sql
commission_transactions {
  _id: ObjectId (Primary Key)
  affiliateId: ObjectId (ref: affiliates) - ID của affiliate
  orderId: ObjectId (ref: orders) - ID của đơn hàng
  referralId: ObjectId (ref: referrals) - ID của referral
  amount: Number - Giá trị đơn hàng
  commission: Number - Hoa hồng nhận được
  status: String (PENDING/PAID/CANCELLED) - Trạng thái thanh toán
  transactionDate: Date - Ngày giao dịch
  paidDate: Date - Ngày thanh toán
  paymentMethod: String - Phương thức thanh toán
  paymentReference: String - Mã tham chiếu thanh toán
}
```

### 4. Bảng `affiliate_links`
```sql
affiliate_links {
  _id: ObjectId (Primary Key)
  affiliateId: ObjectId (ref: affiliates) - ID của affiliate
  productId: ObjectId (ref: products) - ID sản phẩm (optional)
  categoryId: ObjectId (ref: categories) - ID danh mục (optional)
  customSlug: String - Slug tùy chỉnh
  clicks: Number (default: 0) - Số lần click
  conversions: Number (default: 0) - Số lần chuyển đổi
  isActive: Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

## 🔌 API Endpoints

### 1. Affiliate Management

#### Đăng ký làm affiliate
```http
POST /api/affiliates/register
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
  "affiliate": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "affiliateCode": "USER123ABC456",
    "commissionRate": 8,
    "status": "ACTIVE"
  }
}
```

#### Lấy thông tin affiliate
```http
GET /api/affiliates/profile
Authorization: Bearer <jwt_token>

Response: {
  "success": true,
  "affiliate": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "affiliateCode": "USER123ABC456",
    "commissionRate": 8,
    "totalEarnings": 1500000,
    "totalReferrals": 25,
    "status": "ACTIVE"
  }
}
```

#### Cập nhật thông tin affiliate
```http
PUT /api/affiliates/profile
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
POST /api/referrals/create
Content-Type: application/json

{
  "affiliateCode": "USER123ABC456",
  "userEmail": "newuser@example.com",
  "userData": {
    "fullName": "Nguyễn Văn B",
    "phone": "0987654321"
  }
}

Response: {
  "success": true,
  "referral": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "status": "PENDING",
    "commissionEarned": 0
  }
}
```

#### Lấy danh sách referrals
```http
GET /api/referrals/my-referrals
Authorization: Bearer <jwt_token>
Query: ?page=1&limit=10&status=APPROVED

Response: {
  "success": true,
  "referrals": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "referredUserEmail": "user1@example.com",
      "status": "APPROVED",
      "commissionEarned": 50000,
      "referralDate": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

#### Cập nhật trạng thái referral
```http
PUT /api/referrals/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "APPROVED",
  "commissionEarned": 50000,
  "notes": "User đã mua hàng đầu tiên"
}
```

### 3. Commission Tracking

#### Tính commission khi có order
```http
POST /api/commissions/calculate
Authorization: Bearer <system_token>
Content-Type: application/json

{
  "orderId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "userId": "64f8a1b2c3d4e5f6a7b8c9d3",
  "orderAmount": 500000
}

Response: {
  "success": true,
  "commission": {
    "affiliateId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "amount": 500000,
    "commission": 40000,
    "status": "PENDING"
  }
}
```

#### Lấy lịch sử commission
```http
GET /api/commissions/history
Authorization: Bearer <jwt_token>
Query: ?page=1&limit=10&status=PAID

Response: {
  "success": true,
  "transactions": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d4",
      "orderId": "64f8a1b2c3d4e5f6a7b8c9d2",
      "amount": 500000,
      "commission": 40000,
      "status": "PAID",
      "transactionDate": "2024-01-15T10:30:00Z",
      "paidDate": "2024-01-20T15:00:00Z"
    }
  ]
}
```

#### Thanh toán commission
```http
PUT /api/commissions/:id/pay
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "paymentMethod": "BANK_TRANSFER",
  "paymentReference": "TX123456789",
  "notes": "Thanh toán tháng 1/2024"
}
```

### 4. Dashboard & Analytics

#### Thống kê affiliate
```http
GET /api/affiliates/dashboard
Authorization: Bearer <jwt_token>

Response: {
  "success": true,
  "dashboard": {
    "totalEarnings": 1500000,
    "totalReferrals": 25,
    "approvedReferrals": 20,
    "pendingReferrals": 5,
    "monthlyStats": [
      {
        "month": "2024-01",
        "earnings": 500000,
        "referrals": 8
      }
    ],
    "recentTransactions": [...]
  }
}
```

#### Báo cáo performance
```http
GET /api/affiliates/reports
Authorization: Bearer <jwt_token>
Query: ?startDate=2024-01-01&endDate=2024-01-31&type=monthly

Response: {
  "success": true,
  "report": {
    "period": "2024-01-01 to 2024-01-31",
    "totalEarnings": 500000,
    "totalReferrals": 8,
    "conversionRate": 62.5,
    "averageCommission": 62500,
    "topProducts": [...]
  }
}
```

## 🔧 Business Logic

### 1. Affiliate Code Generation
```typescript
function generateAffiliateCode(userId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  const userSuffix = userId.substr(-4);
  
  return `${userSuffix}${timestamp}${random}`.toUpperCase();
}

// Ví dụ: USER123ABC456
```

### 2. Commission Calculation
```typescript
function calculateCommission(orderAmount: number, commissionRate: number): number {
  const commission = (orderAmount * commissionRate) / 100;
  return Math.round(commission / 1000) * 1000; // Làm tròn đến 1000
}

// Ví dụ: Order 500,000đ với rate 8% = 40,000đ
```

### 3. Referral Validation
```typescript
async function validateReferral(affiliateCode: string, userEmail: string): Promise<boolean> {
  // Kiểm tra affiliate code hợp lệ
  const affiliate = await AffiliateModel.findOne({ 
    affiliateCode, 
    status: 'ACTIVE' 
  });
  
  if (!affiliate) return false;
  
  // Kiểm tra user chưa được refer trước đó
  const existingReferral = await ReferralModel.findOne({ 
    referredUserEmail: userEmail 
  });
  
  if (existingReferral) return false;
  
  // Kiểm tra không tự refer chính mình
  if (affiliate.userId.toString() === userEmail) return false;
  
  return true;
}
```

### 4. Commission Payout Rules
```typescript
const COMMISSION_RULES = {
  MIN_PAYOUT_AMOUNT: 100000, // 100,000đ
  PAYOUT_SCHEDULE: 'MONTHLY', // Thanh toán hàng tháng
  PAYOUT_DAY: 20, // Ngày 20 hàng tháng
  MIN_REFERRALS: 3, // Tối thiểu 3 referrals
  HOLDING_PERIOD: 30 // Giữ tiền 30 ngày
};

function canPayoutCommission(affiliate: any): boolean {
  const totalEarnings = affiliate.totalEarnings;
  const totalReferrals = affiliate.totalReferrals;
  const lastOrderDate = getLastOrderDate(affiliate._id);
  
  return (
    totalEarnings >= COMMISSION_RULES.MIN_PAYOUT_AMOUNT &&
    totalReferrals >= COMMISSION_RULES.MIN_REFERRALS &&
    daysSince(lastOrderDate) >= COMMISSION_RULES.HOLDING_PERIOD
  );
}
```

## 🔐 Security & Validation

### 1. Rate Limiting
```typescript
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Tối đa 100 requests
  message: 'Quá nhiều requests, vui lòng thử lại sau'
};

// Áp dụng cho các endpoint quan trọng
app.use('/api/affiliates/register', rateLimit);
app.use('/api/referrals/create', rateLimit);
```

### 2. Fraud Prevention
```typescript
function detectFraudulentActivity(affiliateId: string, ipAddress: string): boolean {
  // Kiểm tra IP address
  const suspiciousIPs = ['192.168.1.1', '10.0.0.1'];
  if (suspiciousIPs.includes(ipAddress)) return true;
  
  // Kiểm tra số lượng referrals trong thời gian ngắn
  const recentReferrals = await ReferralModel.countDocuments({
    affiliateId,
    referralDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });
  
  if (recentReferrals > 10) return true; // Quá 10 referrals/ngày
  
  return false;
}
```

### 3. Data Integrity
```typescript
// Sử dụng MongoDB transactions
async function processCommission(orderId: string, affiliateId: string) {
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Tạo commission transaction
      await CommissionModel.create([{
        affiliateId,
        orderId,
        amount: order.amount,
        commission: calculateCommission(order.amount, affiliate.commissionRate),
        status: 'PENDING'
      }], { session });
      
      // Cập nhật tổng earnings của affiliate
      await AffiliateModel.updateOne(
        { _id: affiliateId },
        { $inc: { totalEarnings: commission } },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
}
```

## 📊 Monitoring & Analytics

### 1. Real-time Tracking
```typescript
// WebSocket cho real-time updates
io.on('connection', (socket) => {
  socket.on('join-affiliate-dashboard', (affiliateId) => {
    socket.join(`affiliate-${affiliateId}`);
  });
});

// Emit real-time updates
function emitCommissionUpdate(affiliateId: string, data: any) {
  io.to(`affiliate-${affiliateId}`).emit('commission-update', data);
}
```

### 2. Performance Metrics
```typescript
async function getAffiliatePerformance(affiliateId: string) {
  const stats = await ReferralModel.aggregate([
    { $match: { affiliateId: ObjectId(affiliateId) } },
    {
      $group: {
        _id: {
          year: { $year: '$referralDate' },
          month: { $month: '$referralDate' }
        },
        totalReferrals: { $sum: 1 },
        totalCommission: { $sum: '$commissionEarned' },
        conversionRate: {
          $avg: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ]);
  
  return stats;
}
```

## 🚀 Deployment & Scaling

### 1. Environment Variables
```env
AFFILIATE_COMMISSION_RATE=8
AFFILIATE_MIN_PAYOUT=100000
AFFILIATE_HOLDING_PERIOD=30
AFFILIATE_MAX_REFERRALS_PER_DAY=10
```

### 2. Database Indexes
```typescript
// Tạo indexes cho performance
await AffiliateModel.createIndex({ affiliateCode: 1 });
await ReferralModel.createIndex({ affiliateId: 1, status: 1 });
await ReferralModel.createIndex({ referredUserEmail: 1 });
await CommissionModel.createIndex({ affiliateId: 1, status: 1 });
await CommissionModel.createIndex({ transactionDate: 1 });
```

### 3. Caching Strategy
```typescript
// Redis cache cho affiliate data
const affiliateCache = new Redis();

async function getAffiliateData(affiliateId: string) {
  const cacheKey = `affiliate:${affiliateId}`;
  let affiliate = await affiliateCache.get(cacheKey);
  
  if (!affiliate) {
    affiliate = await AffiliateModel.findById(affiliateId);
    await affiliateCache.setex(cacheKey, 300, JSON.stringify(affiliate)); // Cache 5 phút
  }
  
  return affiliate;
}
```

## 📝 Testing

### 1. Unit Tests
```typescript
describe('Affiliate System', () => {
  test('should generate unique affiliate code', () => {
    const code1 = generateAffiliateCode('user123');
    const code2 = generateAffiliateCode('user123');
    expect(code1).not.toBe(code2);
  });
  
  test('should calculate commission correctly', () => {
    const commission = calculateCommission(1000000, 8);
    expect(commission).toBe(80000);
  });
});
```

### 2. Integration Tests
```typescript
describe('Affiliate API', () => {
  test('should create affiliate account', async () => {
    const response = await request(app)
      .post('/api/affiliates/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ commissionRate: 8 });
    
    expect(response.status).toBe(201);
    expect(response.body.affiliate.affiliateCode).toBeDefined();
  });
});
```

---

## 🎯 **Kết luận**

Hệ thống affiliate backend cần xử lý:
- **Quản lý affiliate**: Đăng ký, cập nhật thông tin
- **Tracking referral**: Theo dõi người được giới thiệu
- **Tính toán commission**: Tự động tính hoa hồng
- **Thanh toán**: Quản lý việc chi trả
- **Bảo mật**: Chống gian lận, rate limiting
- **Analytics**: Báo cáo hiệu suất

Với kiến trúc này, hệ thống có thể scale tốt và xử lý được lượng lớn affiliate users.
