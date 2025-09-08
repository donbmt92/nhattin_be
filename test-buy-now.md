# Test Tính Năng Mua Ngay

## API Endpoint
```
POST /orders/buy-now
```

## Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Test Cases

### 1. Mua ngay cơ bản
```json
{
  "id_product": "65f2e0a3a2e0c60c848d3e12",
  "quantity": 1,
  "note": "Mua ngay - giao hàng nhanh"
}
```

### 2. Mua ngay với thanh toán và voucher
```json
{
  "id_product": "65f2e0a3a2e0c60c848d3e12",
  "quantity": 2,
  "id_payment": "65f2e0a3a2e0c60c848d3e14",
  "note": "Mua ngay với thanh toán",
  "voucher": "SUMMER2024",
  "affiliateCode": "AFFILIATE123"
}
```

### 3. Test lỗi - Sản phẩm không tồn tại
```json
{
  "id_product": "000000000000000000000000",
  "quantity": 1,
  "note": "Test lỗi"
}
```

### 4. Test lỗi - Số lượng không hợp lệ
```json
{
  "id_product": "65f2e0a3a2e0c60c848d3e12",
  "quantity": 0,
  "note": "Test lỗi"
}
```

## Response Success (201)
```json
{
  "_id": "65f2e0a3a2e0c60c848d3e15",
  "uid": "65f2e0a3a2e0c60c848d3e13",
  "id_payment": "65f2e0a3a2e0c60c848d3e14",
  "note": "Mua ngay với thanh toán",
  "voucher": "SUMMER2024",
  "status": "pending",
  "total_items": 2,
  "items": [
    {
      "id": "65f2e0a3a2e0c60c848d3e16",
      "quantity": 2,
      "old_price": 500000,
      "discount_precent": 10,
      "final_price": 450000,
      "product_snapshot": {
        "name": "Sản phẩm test",
        "image": "image.jpg",
        "description": "Mô tả sản phẩm",
        "base_price": 500000,
        "category_id": "65f2e0a3a2e0c60c848d3e17",
        "category_name": "Danh mục test"
      }
    }
  ],
  "affiliateCode": "AFFILIATE123",
  "commissionAmount": 0,
  "commissionStatus": "PENDING",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Response Error (400)
```json
{
  "statusCode": 400,
  "message": "Sản phẩm không tồn tại: 000000000000000000000000",
  "error": "Bad Request"
}
```

## Các tính năng đã implement:

✅ **Tạo DTO BuyNowDto** với validation đầy đủ
✅ **Thêm method buyNow** trong OrdersService với:
- Validation sản phẩm tồn tại
- Kiểm tra số lượng hợp lệ
- Kiểm tra tồn kho
- Tạo đơn hàng mới
- Tạo order item
- Cập nhật tồn kho
- Xử lý affiliate commission
- Transaction safety

✅ **Thêm endpoint POST /orders/buy-now** trong OrdersController với:
- Swagger documentation đầy đủ
- API examples
- Error handling
- Authentication required

✅ **Tích hợp với hệ thống hiện có**:
- Inventory management
- Affiliate system
- Order management
- Payment system

## So sánh với tính năng cũ:

| Tính năng | Cũ (Cart) | Mới (Buy Now) |
|-----------|-----------|---------------|
| Quy trình | Thêm vào giỏ → Đặt hàng | Mua trực tiếp |
| Số bước | 2 bước | 1 bước |
| API calls | 2 API calls | 1 API call |
| User experience | Phức tạp hơn | Đơn giản hơn |
| Use case | Mua nhiều sản phẩm | Mua nhanh 1 sản phẩm |
