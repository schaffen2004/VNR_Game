# Đường tới chiến thắng

Game chiến thuật 2D về Chiến dịch Điện Biên Phủ, kết hợp căn góc bắn pháo, điều bộ binh, xe tăng yểm trợ và đào hầm trú ẩn. Project chạy trực tiếp bằng HTML5 Canvas 2D, CSS3 và JavaScript thuần.

## Chạy game

1. Giải nén project.
2. Mở `index.html` bằng Chrome, Edge hoặc Firefox.
3. Chọn **Chơi** → chọn cứ điểm → chọn level → xem bản đồ → **Bắt đầu triển khai**.

Có thể chạy qua máy chủ cục bộ:

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`.

## Năm bản đồ chiến dịch

Các màn được mở tuần tự sau khi hoàn thành màn trước:

1. **Đồi Him Lam:** rừng → đất trống → dây thép gai → lô cốt → pháo địch.
2. **Đồi Độc Lập:** rừng → sườn đồi trống → bãi mìn → hàng rào → lô cốt → ụ súng → pháo địch.
3. **Đồi C1:** chiến hào xuất phát → nhiều lớp mìn và hàng rào đan xen → lô cốt → ụ súng → pháo địch.
4. **Sân bay Mường Thanh:** chiến hào xuất phát → đường băng → xe tăng M24 địch → bắn máy bay tiếp tế C-47.
5. **Hầm De Castries:** hầm xuất phát → cầu Mường Thanh → dây thép gai → bãi mìn → xe tăng → lô cốt → pháo địch → hầm chỉ huy.

Mỗi bản đồ có địa hình riêng trong `js/physics.js` và dữ liệu công sự riêng trong `js/data.js`.

## Sửa lỗi pháo địch bắn vào công sự đồng minh

Phiên bản V2 bổ sung ba lớp bảo vệ:

- AI tìm điểm rơi nằm ngoài vùng an toàn quanh lô cốt, xe tăng, hàng rào, pháo và hầm của địch.
- Nếu quân ta áp sát quá gần và không còn điểm rơi an toàn, pháo địch ngừng bắn trong lượt đó.
- Đạn gián tiếp của địch không va chạm và không gây sát thương lên công sự cùng phe.

Logic nằm trong:

```text
js/enemyAI.js
js/artillery.js
js/game.js
```

## Hình dáng item

Item vẫn được vẽ hoàn toàn bằng Canvas 2D để tiết kiệm RAM và không phụ thuộc asset ngoài. Renderer V2 bổ sung:

- Lô cốt đất–bê tông có bờ đất, bao cát và khe bắn.
- Ụ súng máy có vòng bao cát, súng trên giá và chớp đầu nòng.
- Pháo địch mô phỏng lựu pháo 105 mm có lá chắn, bánh xe và càng pháo.
- Xe tăng địch mô phỏng M24 Chaffee với thân xích, năm bánh chịu lực, tháp pháo và nòng dài.
- Máy bay tiếp tế mô phỏng dáng C-47 hai động cơ và được đặt trên không thay vì nằm trên mặt đất.
- Hầm De Castries có mái thép vòm, lớp bao cát và cửa hầm.
- Dây thép gai được vẽ dạng cuộn concertina có cọc; mìn được thể hiện chìm một phần dưới đất.
- Cầu Mường Thanh có mặt cầu và hệ giàn thép tam giác.

Tài liệu đối chiếu nằm tại `assets/images/TAI_LIEU_THAM_KHAO.md`.

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

## Cửa hàng và khí tài

Xu dùng để nâng:

- Số xe tăng yểm trợ mang theo.
- Cơ số đạn mỗi xe tăng.
- Số đạn pháo tối đa theo từng loại.
- Quân số tối đa trong mỗi đơn vị bộ binh.

Trang **Khí tài** cho phép chọn biên chế thực tế mang vào trận trong giới hạn đã mua.

## Điều kiện thắng và thua

- Thắng ngay khi vô hiệu hóa mục tiêu cuối và đưa bộ binh tới điểm chiếm; không cần giữ qua nhiều lượt.
- Các màn có hàng rào yêu cầu phá ít nhất một cửa qua hàng rào.
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

## Điều khiển nhanh

- A/D hoặc kéo chuột giữa: di chuyển camera.
- Con lăn: phóng to/thu nhỏ.
- Mũi tên trái/phải: chỉnh góc pháo.
- Mũi tên lên/xuống: chỉnh lực.
- Space: khai hỏa.
- E: kết thúc giai đoạn.
- M/T/F: di chuyển/đào hầm/tấn công.
- Chuột trái hoặc kéo vùng: chọn đơn vị.
- Chuột phải: thực hiện lệnh tại vị trí hoặc mục tiêu.

## Dữ liệu lưu

LocalStorage V2 sử dụng:

- `duongToiChienThangProfileV2`
- `duongToiChienThangSaveV2`
- `duongToiChienThangSettingsV2`
- `duongToiChienThangTutorialV2`

Game giữ riêng hồ sơ chiến dịch (xu, nâng cấp, lịch sử). Bản lưu trận đang chơi dùng khóa V5 để tránh xung đột với cơ chế chiến hào tuyến tính của bản cũ.

## Điều chỉnh cơ số đạn và tự động tấn công

- Mọi loại đạn pháo bắt đầu với tối thiểu 10 viên.
- Mỗi xe tăng bắt đầu với tối thiểu 10 viên; cửa hàng có thể nâng lên tối đa 15 viên/xe.
- Khi nhận lệnh **Tấn công**, bộ binh tự bắn liên tục đến khi mục tiêu bị phá hoặc có lệnh khác.
- Xe tăng tự bắn liên tiếp bằng số đạn còn lại trong giai đoạn Điều binh; khi kết thúc giai đoạn, lệnh tấn công tự dừng.
- Nhãn trên xe trong bản đồ hiển thị **XE TĂNG**, còn số đạn được theo dõi trong bảng đơn vị.


## Hầm trú ẩn và cơ chế chui xuống

- Chọn từ một đến bốn tổ bộ binh, bật **Đào hầm** rồi chọn vị trí phía trước.
- Các tổ được chọn cùng thi công một hầm chìm dưới mặt đất.
- Khi tiến độ đạt 100%, đúng các tổ đã tham gia xây dựng sẽ tự chui xuống hầm.
- Bộ binh trong hầm được che chắn khoảng 82%, không kích hoạt mìn bề mặt và được bờ đất che phần thân dưới.
- Hầm có sức chứa tương ứng số tổ được giao xây, tối đa bốn tổ.
- Ra lệnh Di chuyển, Tấn công, Xung phong hoặc Rút lui để đơn vị rời hầm.
- Hầm có thể bị pháo làm hư hại; khi hầm mất khả năng bảo vệ, quân sẽ tự nổi lên mặt đất.
