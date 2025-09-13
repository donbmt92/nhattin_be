# Hướng dẫn Deploy Nhanh lên VPS

## Thông tin VPS
- **IP**: 69.62.83.168
- **Domain**: api.nhattinsoftware.com
- **SSH**: root@69.62.83.168
- **Port**: 4000 (không dùng 3000, 3080)

## Bước 1: Chuẩn bị VPS (Chạy trên VPS)

```bash
# Kết nối SSH
ssh root@69.62.83.168

# Cập nhật hệ thống
apt update && apt upgrade -y

# Cài đặt Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Cài đặt PM2
npm install -g pm2

# Cài đặt Nginx
apt install nginx -y
systemctl enable nginx
systemctl start nginx

# Cài đặt Certbot
apt install certbot python3-certbot-nginx -y
```

## Bước 2: Upload Code lên VPS

### Từ máy local, chạy lệnh sau:
```bash
# Upload toàn bộ thư mục nhattin_be lên VPS
scp -r ./nhattin_be/* root@69.62.83.168:/var/www/nhattin-api/
```

### Hoặc tạo thư mục và clone từ Git:
```bash
# Trên VPS
mkdir -p /var/www/nhattin-api
cd /var/www/nhattin-api
git clone <your-repository-url> .
```

## Bước 3: Cấu hình ứng dụng

```bash
# Trên VPS
cd /var/www/nhattin-api

# Cài đặt dependencies
npm install

# Build ứng dụng
npm run build

# Tạo file .env
nano .env
```

**Nội dung file .env:**
```env
NODE_ENV=production
PORT=4000
MONGOURL=mongodb://localhost:27017/remote
DATABASE=remote
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Bước 4: Cấu hình Nginx

```bash
# Copy file cấu hình Nginx
cp nginx-config.conf /etc/nginx/sites-available/api.nhattinsoftware.com

# Kích hoạt site
ln -s /etc/nginx/sites-available/api.nhattinsoftware.com /etc/nginx/sites-enabled/

# Kiểm tra cấu hình
nginx -t

# Reload Nginx
systemctl reload nginx
```

## Bước 5: Cài đặt SSL

```bash
# Cài đặt SSL certificate
certbot --nginx -d api.nhattinsoftware.com
```

## Bước 6: Khởi động ứng dụng

```bash
# Cấp quyền thực thi cho script deploy
chmod +x deploy.sh

# Khởi động ứng dụng với PM2
pm2 start ecosystem.config.js

# Lưu cấu hình PM2
pm2 save
pm2 startup
```

## Bước 7: Cấu hình Firewall

```bash
# Cài đặt UFW
ufw enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 4000
```

## Kiểm tra kết quả

```bash
# Kiểm tra trạng thái ứng dụng
pm2 status

# Kiểm tra logs
pm2 logs nhattin-api

# Kiểm tra Nginx
systemctl status nginx

# Kiểm tra port
netstat -tlnp | grep :4000
```

## Truy cập ứng dụng

- **HTTPS**: https://api.nhattinsoftware.com
- **API Docs**: https://api.nhattinsoftware.com/docs
- **Health Check**: https://api.nhattinsoftware.com/health

## Deploy tự động (sau này)

```bash
# Chạy script deploy tự động
./deploy.sh
```

## Troubleshooting

```bash
# Xem logs ứng dụng
pm2 logs nhattin-api

# Xem logs Nginx
tail -f /var/log/nginx/error.log

# Restart services
pm2 restart nhattin-api
systemctl restart nginx

# Kiểm tra SSL
certbot certificates
```

## Lưu ý quan trọng

1. **Đảm bảo domain `api.nhattinsoftware.com` đã trỏ về IP `69.62.83.168`**
2. **Thay đổi các thông tin trong file .env phù hợp với môi trường của bạn**
3. **Ứng dụng sẽ chạy trên port 4000, không phải 3000 hay 3080**
4. **SSL sẽ được cài đặt tự động qua Certbot**
5. **PM2 sẽ tự động restart ứng dụng khi có lỗi**
