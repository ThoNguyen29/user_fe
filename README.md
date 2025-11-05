# 🚀 Propharm - Frontend Only Version

## 📋 Mô Tả Dự Án

Đây là phiên bản **Frontend-Only** của ứng dụng Blockchain Pharma Trace - Medicine App. Phiên bản này chỉ chứa giao diện người dùng React và không yêu cầu backend hay database.

## ✨ Tính Năng

- ✅ **Giao diện hiện đại** với Tailwind CSS
- ✅ **Responsive design** cho mọi thiết bị
- ✅ **Glass morphism effects** và animations
- ✅ **Product catalog** với dữ liệu mẫu
- ✅ **Search functionality** (demo)
- ✅ **Shopping cart** và wishlist (demo)
- ✅ **User interface** hoàn chỉnh
- ✅ **Không cần backend** hay database

## 🛠️ Công Nghệ Sử Dụng

- **React 19** - UI library
- **Vite** - Build tool và dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library

## 🚀 Cách Chạy Dự Án

### Yêu Cầu
- Node.js 16+
- npm hoặc yarn

### Cài Đặt và Chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy development server
npm run dev

# 3. Mở trình duyệt tại http://localhost:5173
```

### Các Scripts Khác

```bash
# Build cho production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## 📱 Giao Diện

### Trang Chủ
- **Navbar** với logo, search, và user menu
- **Banner** với call-to-action buttons
- **Product sections** hiển thị các loại thuốc
- **Footer** với thông tin liên hệ

### Tính Năng Demo
- **Search**: Hiển thị alert khi search
- **Add to Cart**: Hiển thị alert khi thêm vào giỏ
- **Wishlist**: Hiển thị alert khi thêm vào wishlist
- **User Profile**: Hiển thị alert khi click profile

## 🎨 Thiết Kế

### Màu Sắc
- **Primary**: Blue gradient (#3B82F6 to #1D4ED8)
- **Secondary**: Yellow/Orange accents
- **Background**: Light blue gradient
- **Text**: Gray scale

### Components
- **Glass morphism** effects với backdrop blur
- **Gradient text** và buttons
- **Hover animations** và transitions
- **Custom scrollbar** styling

## 📦 Cấu Trúc Thư Mục

```
Frontend_Only_Version/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Banner.jsx
│   │   ├── ProductCard.jsx
│   │   └── ProductSection.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Tùy Chỉnh

### Thêm Sản Phẩm Mới
Chỉnh sửa file `src/App.jsx` và thêm sản phẩm vào các arrays:
- `fluProducts`
- `coughProducts` 
- `vitaminProducts`

### Thay Đổi Màu Sắc
Chỉnh sửa file `src/index.css` để thay đổi:
- Gradient colors
- Background colors
- Custom CSS variables

### Thêm Components Mới
Tạo file mới trong `src/components/` và import vào `App.jsx`

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2-3 columns)
- **Desktop**: 1024px - 1280px (3-4 columns)
- **Large**: > 1280px (4+ columns)

## 🎯 Demo Features

Tất cả các tính năng tương tác đều hiển thị alert để demo:
- Search functionality
- Add to cart
- Add to wishlist
- User profile
- Category filtering

## 🚀 Deployment

### Static Hosting
```bash
# Build project
npm run build

# Upload dist/ folder lên hosting service
# Vercel, Netlify, GitHub Pages, etc.
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra Node.js version (cần 16+)
2. Xóa `node_modules` và `package-lock.json`, sau đó `npm install` lại
3. Kiểm tra console logs trong browser
4. Đảm bảo port 5173 không bị chiếm dụng

## 🎉 Kết Luận

Phiên bản Frontend-Only này cung cấp:
- ✅ Giao diện hoàn chỉnh và đẹp mắt
- ✅ Không cần backend hay database
- ✅ Dễ dàng deploy và chia sẻ
- ✅ Phù hợp cho demo và presentation
- ✅ Có thể mở rộng thành full-stack app

**Chúc bạn sử dụng vui vẻ! 🎉**

