# 🚀 Hướng Dẫn Chạy Frontend-Only Version

## 📋 Yêu Cầu
- **Node.js** 16+ 
- **npm** hoặc **yarn**

## 🔧 Cài Đặt Nhanh

### 1. Di chuyển vào thư mục dự án
```bash
cd Frontend_Only_Version
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Chạy development server
```bash
npm run dev
```

### 4. Mở trình duyệt
Truy cập: `http://localhost:5173`

## ⚡ Scripts Có Sẵn

```bash
# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## 🎯 Tính Năng Demo

- ✅ **Search**: Click search sẽ hiển thị alert
- ✅ **Add to Cart**: Click "Add" sẽ hiển thị alert  
- ✅ **Wishlist**: Click heart icon sẽ hiển thị alert
- ✅ **User Profile**: Click avatar sẽ hiển thị alert
- ✅ **View All**: Click "View All" sẽ hiển thị alert

## 📱 Responsive Design

- **Mobile**: 1 cột sản phẩm
- **Tablet**: 2-3 cột sản phẩm  
- **Desktop**: 3-4 cột sản phẩm
- **Large**: 4+ cột sản phẩm

## 🎨 Customization

### Thêm sản phẩm mới:
Chỉnh sửa file `src/App.jsx` và thêm vào arrays:
- `fluProducts`
- `coughProducts`
- `vitaminProducts`

### Thay đổi màu sắc:
Chỉnh sửa file `src/index.css`

## 🚀 Deployment

### Static Hosting:
```bash
npm run build
# Upload thư mục dist/ lên Vercel, Netlify, GitHub Pages
```

## ❗ Troubleshooting

### Lỗi thường gặp:
1. **Port đã được sử dụng**: Thay đổi port trong `vite.config.js`
2. **Node version**: Cần Node.js 16+
3. **Dependencies**: Xóa `node_modules` và `npm install` lại

### Kiểm tra:
```bash
node --version  # Cần >= 16
npm --version   # Cần >= 8
```

## 🎉 Hoàn Thành!

Bạn đã có một ứng dụng frontend hoàn chỉnh không cần backend!

**URL**: http://localhost:5173

