# 🌾 Nông Trại Mộng Mơ — Game Nông Trại Pixel Art Tiếng Việt

**Nông Trại Mộng Mơ** là tựa game mô phỏng nông trại 2D Pixel Art 16-bit chạy trực tiếp trên trình duyệt, được thiết kế và Việt hóa 100% với thế giới sống động tại **Thung Lũng Mây Trắng**.

---

## ✨ Tính Năng Nổi Bật

1. **Ngôn Ngữ Tiếng Việt Hoàn Chỉnh 100%**:
   - Toàn bộ màn hình bắt đầu, HUD, túi đồ, cửa hàng, lò rèn, bảng nhiệm vụ, hội thoại NPC, thông báo và hướng dẫn chơi đều sử dụng tiếng Việt có dấu tự nhiên, sắc nét.
2. **Đồ Họa Pixel Art 16-Bit Sắc Nét**:
   - Toàn bộ tileset địa hình, ngôi nhà gỗ, chuồng trại, cửa hàng làng, cây trồng qua 4 giai đoạn phát triển, vật nuôi (Gà, Bò sữa), nhân vật chính và 4 NPC được vẽ thủ công bằng bộ dựng Canvas Pixel Art (`PixelArtGenerator.ts`) không phụ thuộc tài nguyên ngoại tuyến.
3. **Hệ Thống Gameplay Đầy Đủ & Kết Nối Chặt Chẽ**:
   - **Trồng trọt**: Cuốc đất (`Cuốc Đất`), gieo hạt (`Hạt Củ Cải Trắng`, `Hạt Dâu Tây Mộng Mơ`, `Hạt Bắp Nếp Vàng`, `Hạt Cà Chua Đỏ`, `Hạt Bí Ngô Hoàng Kim`, `Hạt Hoa Hướng Dương`), tưới nước (`Bình Tưới Nước`) và thu hoạch khi cây chín.
   - **Thời gian, Thời tiết & Mùa vụ**: Chu kỳ 4 mùa (`Xuân`, `Hạ`, `Thu`, `Đông`), 3 kiểu thời tiết (`Nắng Đẹp`, `Mưa Rào` tự động tưới toàn bộ ruộng, `Gió Mát`) và hiệu ứng ánh sáng Ngày / Hoàng hôn / Đêm.
   - **Chăn nuôi & Câu cá**: Chăm sóc đàn gà và bò sữa tại Chuồng Trại để thu hoạch `Trứng Gà Ta Tươi` và `Sữa Bò Tươi Nguyên Chất`; câu cá tại cầu gỗ Hồ Gương.
   - **Kinh tế, Nâng cấp & Mở rộng**: Bán nông sản qua `Thùng Giao Hàng` hoặc tại `Cửa Hàng Nông Sản`; rèn nâng cấp nông cụ lên bậc Đồng Đỏ, Bạc Sáng, Hoàng Kim; mở khóa `Khu Ruộng Phía Nam` (+36 ô đất).
   - **Nhiệm vụ & Cư dân NPC**: Hệ thống 6 nhiệm vụ cốt truyện có thưởng Vàng và vật phẩm; trò chuyện và tặng quà tăng độ thân thiết với 4 NPC (`Bác Ba Nông Dân`, `Dì Tư Hoa`, `Chú Bảy Thợ Rèn`, `Bé Mây`).
   - **Lưu & Tải Tiến Trình**: Tự động lưu vào `localStorage` và hỗ trợ lưu/tải thủ công bất kỳ lúc nào.

---

## 🚀 Hướng Dẫn Chạy Dự Án

### Yêu cầu hệ thống
- Node.js >= 18

### Cài đặt và chạy môi trường phát triển (Development)
```bash
npm install
npm run dev
```

### Đóng gói bản phát hành (Production Build)
```bash
npm run build
npm run preview
```

---

## 🎮 Điều Khiển Trong Game
- **Di chuyển**: Phím `W A S D` hoặc `Phím Mũi Tên` (hoặc cụm phím D-Pad cảm ứng trên Mobile).
- **Thao tác công cụ / Tương tác**: Phím `Space`, phím `E`, nút **Hành động** trên HUD hoặc nhấp chuột / chạm trực tiếp vào ô đất, cây trồng, vật nuôi, NPC và công trình.
- **Chọn nhanh công cụ**: Phím số `1` đến `9` hoặc nhấn vào ô trên Thanh Công Cụ.
