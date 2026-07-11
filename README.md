# Đường tới chiến thắng

Game chiến thuật 2D về Chiến dịch Điện Biên Phủ, kết hợp căn góc bắn pháo, điều bộ binh, xe tăng yểm trợ và đào chiến hào. Project chạy trực tiếp bằng HTML5 Canvas 2D, CSS3 và JavaScript thuần.

## Chạy game

1. Giải nén project.
2. Mở `index.html` bằng Chrome, Edge hoặc Firefox.
3. Chọn **Chơi** → chọn cứ điểm → chọn level → xem bản đồ → **Vào trận**.

Có thể chạy qua máy chủ cục bộ:

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`.

## Nội dung chính

Trang chủ có Chơi, Cửa hàng, Khí tài, Lịch sử chơi, Hướng dẫn, Cài đặt và số xu hiện có. Đồng xu được thể hiện bằng hình tròn đỏ với ngôi sao vàng năm cánh.

Bốn bản đồ:

1. **Him Lam:** rừng → sông Nậm Rốm → đất trống → bãi mìn → dây thép gai → lô cốt ngoài → chiến hào → hầm chỉ huy trên đồi.
2. **Độc Lập:** khu tập kết → đồng trống → chân đồi → bãi mìn và dây thép gai → công sự vòng ngoài → chiến hào → lô cốt trên đỉnh → hầm chỉ huy.
3. **Sân bay Mường Thanh:** đào hào tiếp cận → phá cứ điểm bảo vệ → bố trí pháo → khống chế đường băng → ngăn máy bay tiếp tế.
4. **Sở chỉ huy Mường Thanh:** hào bao vây → công sự vòng ngoài → ụ súng và xe tăng → hào trung tâm → hầm trú ẩn → chiếm hầm chỉ huy trong địa hình lòng chảo.

## Câu hỏi theo level

Project tích hợp 70 câu trắc nghiệm trong:

```text
assets/data/dbp_quiz.json
js/questions.js
```

- Dễ: 20 câu.
- Trung bình: 25 câu.
- Khó: 25 câu.

Trước mỗi lượt tấn công, người chơi trả lời một câu ngẫu nhiên theo level đã chọn. Trả lời sai không khóa lượt nhưng giảm toàn bộ sát thương của quân ta xuống 50% trong lượt đó.

## Cửa hàng

Xu dùng để nâng:

- Số xe tăng yểm trợ mang theo.
- Cơ số đạn mỗi xe tăng.
- Số đạn pháo tối đa theo từng loại.
- Quân số tối đa trong mỗi đơn vị bộ binh.

Trang **Khí tài** cho phép chọn biên chế thực tế mang vào trận trong giới hạn đã mua.

## Điều kiện thắng và thua

- Thắng khi vô hiệu hóa mục tiêu chỉ huy và đưa bộ binh đến điểm chiếm cứ điểm.
- Chỉ thua khi toàn bộ bộ binh, xe tăng và pháo binh người chơi đều không còn khả năng chiến đấu.
- Không giới hạn số lượt.

## Tối ưu RAM/CPU

- Canvas 2D thuần; không WebGL, không PixiJS và không Canvas GPU phụ.
- DPR nội bộ giới hạn ở 1.
- Game loop mục tiêu khoảng 45 FPS.
- Particle và chữ sát thương có giới hạn, được tái sử dụng.
- Minimap chỉ cập nhật theo chu kỳ.
- Âm thanh tải theo nhu cầu, không tải đồng loạt khi mở trang.

## Thay âm thanh

Xem tài liệu:

```text
assets/sounds/AM_THANH.md
```

Giữ nguyên tên file để chép đè mà không cần sửa mã. Nếu đổi tên hoặc đổi định dạng, sửa đường dẫn trong `js/audio.js`.

## Thay hình ảnh

Xem:

```text
assets/images/TAI_LIEU_THAM_KHAO.md
```

Project hiện vẽ item bằng Canvas để chạy ngay khi không có asset. Có thể thêm sprite PNG nền trong suốt vào `assets/images/` rồi thay các hàm vẽ tương ứng trong `js/renderer.js`.

## Điều khiển nhanh

- A/D hoặc kéo chuột giữa: di chuyển camera.
- Con lăn: phóng to/thu nhỏ.
- Mũi tên trái/phải: chỉnh góc pháo.
- Mũi tên lên/xuống: chỉnh lực.
- Space: khai hỏa.
- E: kết thúc giai đoạn.
- M/T/F: di chuyển/đào hào/tấn công.
- Chuột trái hoặc kéo vùng: chọn đơn vị.
- Chuột phải: thực hiện lệnh tại vị trí hoặc mục tiêu.

## Cấu trúc

```text
duong-toi-chien-thang/
├── index.html
├── css/style.css
├── js/
│   ├── data.js
│   ├── questions.js
│   ├── campaign.js
│   ├── game.js
│   ├── renderer.js
│   └── ...
└── assets/
    ├── data/dbp_quiz.json
    ├── images/TAI_LIEU_THAM_KHAO.md
    ├── sounds/AM_THANH.md
    └── fonts/
```

## Dữ liệu lưu

LocalStorage sử dụng các khóa phiên bản V1:

- `duongToiChienThangProfileV1`
- `duongToiChienThangSaveV1`
- `duongToiChienThangSettingsV1`
- `duongToiChienThangTutorialV1`
