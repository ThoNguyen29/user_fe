# Blockchain Pharma Trace - Frontend with MetaMask Integration

## 🚀 Tính năng chính

- **Kết nối MetaMask**: Người dùng có thể kết nối ví MetaMask để thanh toán
- **Giỏ hàng thông minh**: Quản lý sản phẩm với localStorage persistence
- **Thanh toán blockchain**: Thực hiện giao dịch trên blockchain thông qua MetaMask
- **UI/UX hiện đại**: Giao diện đẹp với Tailwind CSS và animations

## 🛠️ Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

### 3. Truy cập ứng dụng
Mở trình duyệt và truy cập: `http://localhost:5173`

## 🔗 Tích hợp MetaMask

### Yêu cầu
- Cài đặt MetaMask extension trên trình duyệt
- Có Sepolia ETH để test (có thể lấy từ faucet)

### Cách sử dụng
1. **Kết nối ví**: Click "Connect MetaMask" trên navbar
2. **Thêm sản phẩm**: Click "Add" trên sản phẩm muốn mua
3. **Xem giỏ hàng**: Click icon giỏ hàng trên navbar
4. **Thanh toán**: Click "Pay with MetaMask" trong giỏ hàng

## 📁 Cấu trúc dự án

```
src/
├── components/
│   ├── Banner.jsx          # Banner chính
│   ├── Cart.jsx            # Component giỏ hàng
│   ├── MetaMaskConnect.jsx # Component kết nối MetaMask
│   ├── Navbar.jsx          # Navigation bar
│   ├── PaymentModal.jsx    # Modal thanh toán
│   ├── ProductCard.jsx     # Card sản phẩm
│   └── ProductSection.jsx  # Section hiển thị sản phẩm
├── contexts/
│   ├── CartContext.jsx     # Context quản lý giỏ hàng
│   └── Web3Context.jsx     # Context quản lý Web3/MetaMask
└── App.jsx                 # Component chính
```

## 🔧 Smart Contract

Smart contract `PharmaPayment.sol` được tạo để xử lý thanh toán:

- **makePayment()**: Tạo giao dịch thanh toán
- **completePayment()**: Xác nhận giao dịch (chỉ owner)
- **getTransaction()**: Lấy thông tin giao dịch
- **withdraw()**: Rút tiền từ contract

## 🌐 Networks hỗ trợ

- **Sepolia Testnet**: Khuyến nghị cho testing
- **Ethereum Mainnet**: Cho production (cần thay đổi contract address)

## 🎨 UI/UX Features

- **Responsive Design**: Tương thích mọi thiết bị
- **Dark/Light Theme**: Tự động theo hệ thống
- **Animations**: Smooth transitions và hover effects
- **Loading States**: Hiển thị trạng thái loading khi xử lý
- **Error Handling**: Xử lý lỗi một cách thân thiện

## 🔒 Bảo mật

- **MetaMask Integration**: Sử dụng MetaMask để ký giao dịch
- **Input Validation**: Validate tất cả input từ user
- **Error Boundaries**: Xử lý lỗi React components
- **Secure Transactions**: Giao dịch được ký bởi private key của user

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Upload dist/ folder lên hosting
```

### Smart Contract (Sepolia)
1. Compile contract với Hardhat/Remix
2. Deploy lên Sepolia testnet
3. Cập nhật contract address trong frontend

## 📝 Lưu ý

- Đây là phiên bản demo với Sepolia testnet
- Cần có Sepolia ETH để test thanh toán
- Smart contract cần được deploy trước khi sử dụng
- Tất cả giao dịch đều được ghi lại trên blockchain

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
