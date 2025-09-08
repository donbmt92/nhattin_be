# Hệ thống Affiliate Link có thời hạn

## Tổng quan

Hệ thống affiliate link cho phép các affiliate tạo link có thời hạn để chia sẻ sản phẩm và kiếm hoa hồng khi có người mua hàng qua link đó.

## Tính năng chính

### 1. Tạo Affiliate Link
- Tạo link có thời hạn cho sản phẩm cụ thể
- Tự động generate link code unique
- Hỗ trợ đặt tên chiến dịch và ghi chú

### 2. Redirect và Tracking
- Redirect người dùng đến trang sản phẩm khi click link
- Track số lần click và IP addresses
- Tự động hết hạn link sau thời gian quy định

### 3. Commission Tracking
- Tự động tính hoa hồng khi có đơn hàng qua affiliate link
- Track conversion rate và tổng hoa hồng
- Hỗ trợ cả affiliate link và affiliate code truyền thống

## API Endpoints

### Tạo Affiliate Link
```http
POST /affiliate-links
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "campaignName": "Black Friday Sale 2024",
  "notes": "Link cho sản phẩm hot nhất tháng 12"
}
```

### Lấy danh sách Affiliate Links
```http
GET /affiliate-links
Authorization: Bearer <token>
```

### Lấy thống kê Affiliate Links
```http
GET /affiliate-links/stats
Authorization: Bearer <token>
```

### Vô hiệu hóa Affiliate Link
```http
PUT /affiliate-links/{linkCode}/disable
Authorization: Bearer <token>
```

### Redirect Link (Public)
```http
GET /affiliate/redirect/{linkCode}
```

### Cleanup Expired Links (Admin only)
```http
POST /affiliate-links/cleanup-expired
Authorization: Bearer <admin_token>
```

## Cách sử dụng

### 1. Tạo Affiliate Link
```javascript
// Frontend code
const createAffiliateLink = async (productId, expiresAt, campaignName) => {
  const response = await fetch('/api/affiliate-links', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId,
      expiresAt,
      campaignName
    })
  });
  
  const result = await response.json();
  return result.data.shortUrl; // URL để chia sẻ
};
```

### 2. Chia sẻ Link
```javascript
// Copy link để chia sẻ
const shareLink = (shortUrl) => {
  navigator.clipboard.writeText(shortUrl);
  alert('Đã copy link affiliate!');
};
```

### 3. Tracking Conversion
Khi người dùng mua hàng qua affiliate link, hệ thống sẽ tự động:
- Track conversion
- Tính hoa hồng
- Cập nhật thống kê

## Database Schema

### AffiliateLink Collection
```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId, // Reference to Affiliate
  productId: ObjectId,   // Reference to Product
  linkCode: String,      // Unique link code
  originalUrl: String,   // Product page URL
  shortUrl: String,      // Affiliate redirect URL
  expiresAt: Date,       // Expiration date
  clickCount: Number,    // Number of clicks
  conversionCount: Number, // Number of conversions
  totalCommissionEarned: Number, // Total commission earned
  status: String,        // ACTIVE, EXPIRED, DISABLED
  campaignName: String,  // Campaign name (optional)
  notes: String,         // Notes (optional)
  clickedByIPs: [String], // Array of IP addresses
  convertedUserIds: [String], // Array of user IDs who converted
  createdAt: Date,
  updatedAt: Date
}
```

## Cấu hình Environment Variables

```env
# Base URL for affiliate redirects
BASE_URL=http://localhost:3080

# Frontend URL for product pages
FRONTEND_URL=http://localhost:3000
```

## Bảo mật

### 1. Rate Limiting
- Tạo link: 10 requests/phút
- Redirect: 100 requests/phút
- Cleanup: Admin only

### 2. Validation
- Kiểm tra affiliate status trước khi tạo link
- Validate expiration date
- Kiểm tra link status trước khi redirect

### 3. Fraud Prevention
- Track IP addresses để phát hiện spam
- Giới hạn số lượng IP trong danh sách
- Kiểm tra duplicate conversions

## Monitoring và Maintenance

### 1. Cleanup Expired Links
```javascript
// Manual cleanup (Admin)
POST /affiliate-links/cleanup-expired

// Hoặc có thể setup cron job để tự động cleanup
```

### 2. Thống kê Performance
- Conversion rate
- Top performing links
- Total commission earned
- Click tracking

## Lưu ý quan trọng

1. **Thời gian hết hạn**: Link sẽ tự động hết hạn sau thời gian quy định
2. **Tracking**: Mỗi click và conversion đều được track để tính toán hoa hồng
3. **Performance**: Hệ thống được tối ưu với indexes để query nhanh
4. **Scalability**: Có thể mở rộng để hỗ trợ nhiều loại link khác nhau

## Troubleshooting

### Link không hoạt động
- Kiểm tra link có hết hạn không
- Kiểm tra affiliate status
- Kiểm tra link status

### Không tính hoa hồng
- Kiểm tra affiliate code trong order
- Kiểm tra commission rate
- Kiểm tra order status

### Performance issues
- Chạy cleanup expired links
- Kiểm tra database indexes
- Monitor query performance
