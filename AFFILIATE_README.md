# 🚀 Hệ Thống Affiliate - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

Hệ thống Affiliate đã được tích hợp thành công vào dự án **NhatTin Backend** với các tính năng chính:

- ✅ **Affiliate Management**: Đăng ký, quản lý profile affiliate
- ✅ **Referral System**: Hệ thống giới thiệu khách hàng
- ✅ **Commission System**: Tính toán và quản lý hoa hồng
- ✅ **QR Payment Integration**: Tích hợp với hệ thống thanh toán QR hiện có
- ✅ **Dashboard**: Thống kê và báo cáo cho affiliate

## 🗄️ Database Collections

### 1. Affiliates Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  affiliateCode: String,      // Unique affiliate code
  commissionRate: Number,     // Commission rate (1-20%)
  totalEarnings: Number,      // Total commission earned
  totalReferrals: Number,     // Total referrals
  approvedReferrals: Number,  // Approved referrals
  status: String,             // ACTIVE, INACTIVE, SUSPENDED
  paymentInfo: {
    bankName: String,
    accountNumber: String,
    accountHolder: String,
    bankCode: String
  },
  minPayoutAmount: Number,    // Minimum payout amount
  lastPayoutDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Referrals Collection
```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId,      // Reference to Affiliate
  referredUserId: ObjectId,   // Reference to User
  referredUserEmail: String,
  referredUserPhone: String,
  status: String,             // PENDING, APPROVED, REJECTED
  commissionEarned: Number,
  approvedDate: Date,
  conversionDate: Date,
  totalOrderValue: Number,
  totalOrders: Number,
  notes: String,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Commission Transactions Collection
```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId,      // Reference to Affiliate
  orderId: ObjectId,          // Reference to Order
  referralId: ObjectId,       // Reference to Referral
  orderAmount: Number,
  commission: Number,
  commissionRate: Number,
  status: String,             // PENDING, PAID, CANCELLED
  paidDate: Date,
  paymentMethod: String,      // QR_CODE, BANK_TRANSFER, WALLET, CASH
  paymentReference: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

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
  },
  "notes": "Tôi muốn tham gia chương trình affiliate"
}
```

#### Lấy thông tin affiliate profile
```http
GET /affiliates/profile
Authorization: Bearer <jwt_token>
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

#### Lấy dashboard affiliate
```http
GET /affiliates/dashboard
Authorization: Bearer <jwt_token>
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
```

#### Lấy danh sách referrals của affiliate
```http
GET /referrals/my-referrals?page=1&limit=10&status=APPROVED
Authorization: Bearer <jwt_token>
```

### 3. Commission System

#### Lấy lịch sử commission
```http
GET /commissions/history?page=1&limit=10&status=PAID
Authorization: Bearer <jwt_token>
```

## 🔄 Business Flow

### 1. Affiliate Registration Flow
```
1. User đăng nhập → POST /affiliates/register
2. Hệ thống tạo affiliate code duy nhất
3. Tạo affiliate record trong database
4. Cập nhật user với affiliate fields
5. Trả về affiliate code cho user
```

### 2. Referral Flow
```
1. User mới đăng ký với affiliate code
2. Hệ thống tạo referral record
3. Affiliate nhận thông báo referral mới
4. Referral được approve sau khi user mua hàng
```

### 3. Commission Flow
```
1. User mua hàng với affiliate code
2. Order được tạo với affiliate info
3. Sau khi thanh toán thành công
4. Hệ thống tính commission tự động
5. Tạo commission transaction
6. Cập nhật tổng earnings của affiliate
```

## 🔐 Security Features

### 1. Rate Limiting
- **Affiliate Registration**: 5 requests/phút
- **General API**: 100 requests/phút

### 2. Authentication
- Tất cả endpoints yêu cầu JWT token
- User chỉ có thể truy cập dữ liệu của chính mình

### 3. Fraud Prevention
- Kiểm tra số lượng referrals trong 24h
- Validation affiliate code
- Kiểm tra không tự refer chính mình

## 📊 Monitoring & Analytics

### 1. Affiliate Dashboard
- Tổng earnings
- Số lượng referrals
- Tỷ lệ approval
- Ngày payout tiếp theo

### 2. Commission Reports
- Lịch sử commission
- Tổng thu nhập theo tháng
- Thống kê theo payment method

### 3. Referral Analytics
- Conversion rate
- Order value per referral
- Top performing affiliates

## 🚀 Deployment

### 1. Environment Variables
```bash
AFFILIATE_ENABLED=true
AFFILIATE_COMMISSION_RATE=8
AFFILIATE_MIN_PAYOUT=100000
```

### 2. Database Migration
```bash
# Backup database hiện tại
mongodump --db nhattin_db --out ./backup

# Start application
npm run start:prod
```

### 3. Health Check
```bash
# Kiểm tra affiliate collections
curl http://localhost:3000/health

# Kiểm tra database connection
curl http://localhost:3000/health/db
```

## 🧪 Testing

### 1. Unit Tests
```bash
npm run test:affiliate
```

### 2. Integration Tests
```bash
npm run test:e2e
```

### 3. Manual Testing
```bash
# Test affiliate registration
curl -X POST http://localhost:3000/affiliates/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"commissionRate": 8, "paymentInfo": {...}}'
```

## 🔧 Troubleshooting

### 1. Lỗi thường gặp
- **Validation Error**: Kiểm tra commission rate (1-20%)
- **Duplicate Affiliate**: User đã là affiliate
- **Invalid Affiliate Code**: Code không tồn tại hoặc bị suspend

### 2. Logs
```bash
# Xem logs affiliate
tail -f logs/affiliate.log

# Xem commission processing
tail -f logs/commission.log
```

### 3. Database Issues
```bash
# Kiểm tra indexes
db.affiliates.getIndexes()

# Kiểm tra data integrity
db.affiliates.find({status: "ACTIVE"})
```

## 📈 Performance Optimization

### 1. Database Indexes
- `userId`: Unique index
- `affiliateCode`: Unique index
- `status`: Index for filtering
- `totalEarnings`: Index for sorting

### 2. Caching Strategy
- Affiliate profile cache
- Commission calculation cache
- Referral statistics cache

### 3. Rate Limiting
- API rate limiting
- Database query optimization
- Background job processing

## 🎯 Next Steps

### 1. Phase 2 Features
- [ ] Payout automation
- [ ] Advanced analytics
- [ ] Multi-level commission
- [ ] Affiliate marketplace

### 2. Integration Enhancements
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Webhook support
- [ ] API rate limiting

### 3. Monitoring & Alerts
- [ ] Real-time dashboard
- [ ] Performance metrics
- [ ] Error tracking
- [ ] Business intelligence

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:
- **Email**: support@nhattin.com
- **Documentation**: https://docs.nhattin.com/affiliate
- **API Reference**: https://api.nhattin.com/docs

---

**🎉 Hệ thống Affiliate đã sẵn sàng sử dụng!**
