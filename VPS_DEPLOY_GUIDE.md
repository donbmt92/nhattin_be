# Hướng dẫn Deploy NestJS lên VPS

## Thông tin VPS
- **IP**: 69.62.83.168
- **Domain**: api.nhattinsoftware.com
- **SSH**: root@69.62.83.168
- **Port**: Không sử dụng 3000 và 3080

## Bước 1: Chuẩn bị VPS

### 1.1 Kết nối SSH
```bash
ssh root@69.62.83.168
```

### 1.2 Cập nhật hệ thống
```bash
apt update && apt upgrade -y
```

### 1.3 Cài đặt Node.js (phiên bản LTS)
```bash
# Cài đặt Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Kiểm tra phiên bản
node --version
npm --version
```

### 1.4 Cài đặt PM2 (Process Manager)
```bash
npm install -g pm2
```

### 1.5 Cài đặt Nginx
```bash
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

### 1.6 Cài đặt Certbot (SSL)
```bash
apt install certbot python3-certbot-nginx -y
```

## Bước 2: Cấu hình Domain và SSL

### 2.1 Cấu hình DNS
Đảm bảo domain `api.nhattinsoftware.com` trỏ về IP `69.62.83.168`

### 2.2 Cấu hình Nginx
Tạo file cấu hình cho domain:

```bash
nano /etc/nginx/sites-available/api.nhattinsoftware.com
```

Nội dung file:
```nginx
server {
    listen 80;
    server_name api.nhattinsoftware.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2.3 Kích hoạt site
```bash
ln -s /etc/nginx/sites-available/api.nhattinsoftware.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 2.4 Cài đặt SSL
```bash
certbot --nginx -d api.nhattinsoftware.com
```

## Bước 3: Deploy ứng dụng

### 3.1 Tạo thư mục cho ứng dụng
```bash
mkdir -p /var/www/nhattin-api
cd /var/www/nhattin-api
```

### 3.2 Clone repository (hoặc upload code)
```bash
# Nếu sử dụng Git
git clone <your-repository-url> .

# Hoặc upload code bằng SCP từ máy local
# scp -r ./nhattin_be/* root@69.62.83.168:/var/www/nhattin-api/
```

### 3.3 Cài đặt dependencies
```bash
cd /var/www/nhattin-api
npm install
```

### 3.4 Build ứng dụng
```bash
npm run build
```

### 3.5 Tạo file environment
```bash
nano .env
```

Nội dung file .env:
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

### 3.6 Cấu hình PM2
Tạo file ecosystem:
```bash
nano ecosystem.config.js
```

Nội dung file:
```javascript
module.exports = {
  apps: [{
    name: 'nhattin-api',
    script: 'dist/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
```

### 3.7 Khởi động ứng dụng với PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Bước 4: Cấu hình Firewall

### 4.1 Cài đặt UFW
```bash
ufw enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 4000
```

## Bước 5: Cấu hình MongoDB (nếu cần)

### 5.1 Cài đặt MongoDB
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl enable mongod
systemctl start mongod
```

## Bước 6: Kiểm tra và Monitoring

### 6.1 Kiểm tra trạng thái ứng dụng
```bash
pm2 status
pm2 logs nhattin-api
```

### 6.2 Kiểm tra Nginx
```bash
systemctl status nginx
nginx -t
```

### 6.3 Kiểm tra SSL
```bash
certbot certificates
```

## Bước 7: Script tự động deploy

Tạo script deploy tự động:
```bash
nano deploy.sh
```

Nội dung script:
```bash
#!/bin/bash

echo "Starting deployment..."

# Pull latest code
cd /var/www/nhattin-api
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart PM2
pm2 restart nhattin-api

echo "Deployment completed!"
```

Cấp quyền thực thi:
```bash
chmod +x deploy.sh
```

## Troubleshooting

### Kiểm tra logs
```bash
# PM2 logs
pm2 logs nhattin-api

# Nginx logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# System logs
journalctl -u nginx -f
```

### Kiểm tra port
```bash
netstat -tlnp | grep :4000
```

### Restart services
```bash
pm2 restart nhattin-api
systemctl restart nginx
```

## Backup và Maintenance

### Backup database
```bash
mongodump --db remote --out /backup/$(date +%Y%m%d)
```

### Update SSL certificate
```bash
certbot renew --dry-run
```

## Kết quả

Sau khi hoàn thành, ứng dụng sẽ chạy tại:
- **HTTP**: http://api.nhattinsoftware.com
- **HTTPS**: https://api.nhattinsoftware.com
- **API Docs**: https://api.nhattinsoftware.com/docs

Ứng dụng sẽ chạy trên port 4000 và được proxy qua Nginx với SSL certificate.
