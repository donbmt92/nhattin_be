# Test Affiliate Admin APIs

## Endpoints đã tạo

### 1. Lấy danh sách tất cả affiliate (Admin)
```
GET /affiliates/admin/list?page=1&limit=10&status=ACTIVE
Authorization: Bearer <token>
Role: ADMIN
```

### 2. Lấy thống kê affiliate tổng quan (Admin)
```
GET /affiliates/admin/stats
Authorization: Bearer <token>
Role: ADMIN
```

### 3. Lấy chi tiết affiliate theo ID (Admin)
```
GET /affiliates/admin/detail/:id
Authorization: Bearer <token>
Role: ADMIN
```

### 4. Cập nhật trạng thái affiliate (Admin)
```
PUT /affiliates/admin/:id/status
Authorization: Bearer <token>
Role: ADMIN
Body: { "status": "ACTIVE" }
```

### 5. Lấy lịch sử hoa hồng của affiliate (Admin)
```
GET /affiliates/admin/:id/commissions?page=1&limit=10
Authorization: Bearer <token>
Role: ADMIN
```

### 6. Lấy affiliate links của affiliate (Admin)
```
GET /affiliates/admin/:id/links?page=1&limit=10
Authorization: Bearer <token>
Role: ADMIN
```

## Test với Postman hoặc curl

### Test 1: Lấy danh sách affiliate
```bash
curl -X GET "http://localhost:3001/affiliates/admin/list?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 2: Lấy thống kê
```bash
curl -X GET "http://localhost:3001/affiliates/admin/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 3: Cập nhật trạng thái
```bash
curl -X PUT "http://localhost:3001/affiliates/admin/AFFILIATE_ID/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'
```

## Response Format

### Danh sách affiliate
```json
{
  "success": true,
  "data": {
    "affiliates": [
      {
        "_id": "affiliate_id",
        "userId": "user_id",
        "affiliateCode": "USER123ABC456",
        "commissionRate": 5,
        "totalEarnings": 1250000,
        "totalReferrals": 25,
        "approvedReferrals": 20,
        "status": "ACTIVE",
        "minPayoutAmount": 100000,
        "createdAt": "2024-01-15T00:00:00Z",
        "updatedAt": "2024-01-20T00:00:00Z",
        "user": {
          "id": "user_id",
          "name": "Nguyễn Văn A",
          "email": "user@example.com",
          "avatar": "avatar_url"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Thống kê
```json
{
  "success": true,
  "data": {
    "totalAffiliates": 10,
    "activeAffiliates": 8,
    "pendingAffiliates": 2,
    "totalCommissions": 5000000,
    "totalClicks": 0,
    "totalConversions": 50,
    "conversionRate": 2.5
  }
}
```

## Lưu ý

1. Tất cả endpoints đều yêu cầu role ADMIN
2. JWT token phải hợp lệ
3. Pagination hỗ trợ page và limit
4. Filter theo status (PENDING, ACTIVE, REJECTED, SUSPENDED)
5. Commission và Links hiện tại trả về mock data (TODO: tích hợp với service thật)
