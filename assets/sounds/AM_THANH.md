# Hướng dẫn thay đổi âm thanh

Project dùng `HTMLAudioElement` có sẵn của trình duyệt, không dùng thư viện âm thanh ngoài. Âm thanh chỉ được tải khi cần để giảm RAM.

## Danh sách file

| File | Khóa trong mã | Chức năng |
|---|---|---|
| `artillery-fire.wav` | `fire` | Pháo binh người chơi khai hỏa |
| `enemy-artillery.wav` | `enemyFire` | Pháo địch khai hỏa |
| `mortar-fire.wav` | `mortar` | Súng cối địch khai hỏa |
| `explosion.wav` | `explosion` | Vụ nổ đạn pháo, đạn cối và bãi mìn |
| `machinegun.wav` | `machinegun` | Lô cốt hoặc ụ súng máy địch bắn |
| `rifle.wav` | `rifle` | Bộ binh người chơi bắn súng trường |
| `tank-fire.wav` | `tank` | Xe tăng yểm trợ bắn pháo chính |
| `warning.wav` | `warning` | Cảnh báo trước đòn pháo/cối địch |
| `dig.wav` | `dig` | Bộ binh và công binh đào hào |
| `select.wav` | `select` | Chọn đơn vị hoặc xác nhận thao tác |
| `charge.wav` | `charge` | Hiệu lệnh xung phong |
| `deploy.wav` | `deploy` | Triển khai lực lượng khi bắt đầu trận |
| `victory.wav` | `victory` | Chiến thắng |
| `defeat.wav` | `defeat` | Thất bại |
| `battle-ambient.wav` | nhạc nền | Âm thanh nền chiến trường phát lặp |

## Thay file mà không sửa mã

1. Chuẩn bị file mới.
2. Đổi tên file mới giống hoàn toàn tên trong bảng.
3. Chép đè vào thư mục `assets/sounds/`.
4. Tải lại trang bằng `Ctrl + F5` để tránh bộ nhớ đệm trình duyệt.

Ví dụ, muốn đổi tiếng xe tăng: chép đè `assets/sounds/tank-fire.wav`.

## Dùng MP3 hoặc đổi tên file

Mở `js/audio.js`, tìm `SOUND_FILES` và sửa đường dẫn:

```javascript
const SOUND_FILES = Object.freeze({
  fire: 'assets/sounds/phao-ta.mp3',
  enemyFire: 'assets/sounds/phao-dich.mp3',
  tank: 'assets/sounds/xe-tang.mp3'
});
```

Đổi nhạc nền tại dòng:

```javascript
this.ambient = new Audio('assets/sounds/battle-ambient.wav');
```

## Khuyến nghị để ít tốn RAM

- Hiệu ứng ngắn: WAV mono 22.05 kHz hoặc MP3 mono 96–128 kbps.
- Nhạc nền: MP3/OGG 96–128 kbps.
- Cắt bỏ khoảng lặng ở đầu và cuối file.
- Không dùng file âm thanh nhiều phút cho hiệu ứng súng/pháo.
- Giữ âm lượng các file gần bằng nhau để thanh âm lượng hoạt động ổn định.
