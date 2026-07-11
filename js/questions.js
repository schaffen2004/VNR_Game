(function (NS) {
  'use strict';
  // Tự động tạo từ assets/data/dbp_quiz.json. Không sửa thủ công nếu không cần.
  NS.QuizQuestions = Object.freeze([
  {
    "id": 1,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Chiến dịch Điện Biên Phủ chính thức mở màn khi pháo binh ta đồng loạt trút bão lửa xuống cứ điểm Him Lam vào thời điểm chính xác nào?",
    "options": {
      "A": "17h05 ngày 13/3/1954",
      "B": "16h05 ngày 13/3/1954",
      "C": "17h05 ngày 11/3/1954",
      "D": "18h05 ngày 13/3/1954"
    },
    "answer": "A",
    "explanation": "Đúng 17h05 ngày 13/3/1954, 40 khẩu pháo của ta đồng loạt khai hỏa vào trung tâm đề kháng Him Lam, mở màn chiến dịch."
  },
  {
    "id": 2,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Cứ điểm Him Lam được quân Pháp đặt tên tiếng Pháp là gì?",
    "options": {
      "A": "Gabrielle",
      "B": "Béatrice",
      "C": "Anne-Marie",
      "D": "Dominique"
    },
    "answer": "B",
    "explanation": "Him Lam = Béatrice; Gabrielle là đồi Độc Lập, Anne-Marie là Bản Kéo, Dominique là cụm đồi D-E phía Đông."
  },
  {
    "id": 3,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Cụm cứ điểm Hồng Cúm ở phân khu Nam được quân Pháp gọi bằng tên nào?",
    "options": {
      "A": "Claudine",
      "B": "Huguette",
      "C": "Isabelle",
      "D": "Junon"
    },
    "answer": "C",
    "explanation": "Hồng Cúm = Isabelle, cách trung tâm Mường Thanh khoảng 5 km về phía Nam, có sân bay dự bị riêng."
  },
  {
    "id": 4,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Trong hệ thống phòng ngự của Pháp, đồi A1 mang tên gọi nào?",
    "options": {
      "A": "Huguette 2",
      "B": "Eliane 2",
      "C": "Dominique 2",
      "D": "Eliane 1"
    },
    "answer": "B",
    "explanation": "A1 = Eliane 2; C1 = Eliane 1, D1 = Dominique 2 — đều là các cao điểm phía Đông phân khu trung tâm."
  },
  {
    "id": 5,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Đại đoàn nào của ta đảm nhiệm tiến công tiêu diệt trung tâm đề kháng Him Lam trong trận mở màn?",
    "options": {
      "A": "Đại đoàn 312",
      "B": "Đại đoàn 308",
      "C": "Đại đoàn 316",
      "D": "Đại đoàn 304"
    },
    "answer": "A",
    "explanation": "Đại đoàn 312 do Đại đoàn trưởng Lê Trọng Tấn chỉ huy đánh trận mở màn, hoàn thành nhiệm vụ lúc 23h30 cùng ngày 13/3."
  },
  {
    "id": 6,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Hai trung đoàn nào của Đại đoàn 312 trực tiếp tiến công Him Lam tối 13/3/1954?",
    "options": {
      "A": "Trung đoàn 209 và Trung đoàn 174",
      "B": "Trung đoàn 141 và Trung đoàn 165",
      "C": "Trung đoàn 141 và Trung đoàn 209",
      "D": "Trung đoàn 165 và Trung đoàn 88"
    },
    "answer": "C",
    "explanation": "Trung đoàn 141 và 209 (Đại đoàn 312) đánh Him Lam; Trung đoàn 165 sau đó tham gia đánh Độc Lập."
  },
  {
    "id": 7,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Đêm 6/5/1954, trung đoàn nào giữ vai trò chủ công đánh chiếm hoàn toàn đồi A1?",
    "options": {
      "A": "Trung đoàn 88, Đại đoàn 308",
      "B": "Trung đoàn 174, Đại đoàn 316",
      "C": "Trung đoàn 57, Đại đoàn 304",
      "D": "Trung đoàn 141, Đại đoàn 312"
    },
    "answer": "B",
    "explanation": "Trung đoàn 174 do Trung đoàn trưởng Nguyễn Hữu An chỉ huy; đến 4h30 sáng 7/5 ta làm chủ hoàn toàn A1."
  },
  {
    "id": 8,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Viên sĩ quan chỉ huy pháo binh Pháp tại Điện Biên Phủ đã tự sát bằng lựu đạn vì bất lực trước pháo binh ta là ai?",
    "options": {
      "A": "Trung tá André Lalande",
      "B": "Trung tá Pierre Langlais",
      "C": "Đại tá Charles Piroth",
      "D": "Trung tá Jules Gaucher"
    },
    "answer": "C",
    "explanation": "Đại tá một tay Charles Piroth tự sát đêm 15/3/1954 sau khi Him Lam, Độc Lập liên tiếp thất thủ mà pháo binh Pháp không thể phản pháo hiệu quả."
  },
  {
    "id": 9,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Đờ Cát-xtơ-ri (De Castries) được thăng quân hàm Thiếu tướng ngay giữa vòng vây vào ngày nào?",
    "options": {
      "A": "26/4/1954",
      "B": "16/3/1954",
      "C": "16/4/1954",
      "D": "6/4/1954"
    },
    "answer": "C",
    "explanation": "Ngày 16/4/1954, Pháp thăng hàm Thiếu tướng cho De Castries; lon và rượu mừng được thả dù xuống tập đoàn cứ điểm."
  },
  {
    "id": 10,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Viên trung tá chỉ huy Bán lữ đoàn Lê dương số 13 tử trận ngay tối 13/3/1954 do trúng pháo của ta là ai?",
    "options": {
      "A": "André Lalande",
      "B": "Pierre Langlais",
      "C": "Marcel Bigeard",
      "D": "Jules Gaucher"
    },
    "answer": "D",
    "explanation": "Trung tá Jules Gaucher, chỉ huy 13e DBLE kiêm khu trung tâm, chết ngay tại hầm chỉ huy trong loạt pháo kích mở màn."
  },
  {
    "id": 11,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Cứ điểm Độc Lập (Gabrielle) do đơn vị nào của quân Pháp trấn giữ?",
    "options": {
      "A": "Tiểu đoàn 3, Bán lữ đoàn Lê dương số 13 (III/13 DBLE)",
      "B": "Tiểu đoàn 1, Trung đoàn bộ binh Maroc số 4 (I/4 RTM)",
      "C": "Tiểu đoàn dù xung kích số 8 (8e BPC)",
      "D": "Tiểu đoàn 5, Trung đoàn bộ binh Algérie số 7 (V/7 RTA)"
    },
    "answer": "D",
    "explanation": "V/7 RTA giữ Độc Lập; III/13 DBLE giữ Him Lam, còn I/4 RTM bố trí ở cụm Eliane."
  },
  {
    "id": 12,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Vào thời điểm cao nhất, lực lượng Pháp tại Điện Biên Phủ có bao nhiêu tiểu đoàn bộ binh và tiểu đoàn dù?",
    "options": {
      "A": "15 tiểu đoàn",
      "B": "17 tiểu đoàn",
      "C": "12 tiểu đoàn",
      "D": "21 tiểu đoàn"
    },
    "answer": "B",
    "explanation": "Ban đầu 12 tiểu đoàn, sau khi tăng viện bằng đường không lên tới 17 tiểu đoàn, tổng quân số khoảng 16.200 tên."
  },
  {
    "id": 13,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Khối bộc phá đánh sập hầm ngầm đồi A1 nặng khoảng bao nhiêu và được điểm hỏa vào thời điểm nào?",
    "options": {
      "A": "Gần 960 kg, nổ lúc 20h30 ngày 5/5/1954",
      "B": "Gần 960 kg, nổ lúc 20h30 ngày 6/5/1954",
      "C": "Gần 1.060 kg, nổ lúc 19h30 ngày 6/5/1954",
      "D": "Gần 860 kg, nổ lúc 21h30 ngày 6/5/1954"
    },
    "answer": "B",
    "explanation": "Bộ đội ta đào đường hầm dài 49 m xuyên vào lòng đồi, đặt khối bộc phá gần 1 tấn (960 kg); tiếng nổ lúc 20h30 ngày 6/5 cũng là hiệu lệnh tổng công kích đợt 3."
  },
  {
    "id": 14,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Đại tướng Võ Nguyên Giáp quyết định thay đổi phương châm tác chiến sang \"đánh chắc, tiến chắc\" vào ngày nào?",
    "options": {
      "A": "25/1/1954",
      "B": "5/2/1954",
      "C": "26/1/1954",
      "D": "14/1/1954"
    },
    "answer": "C",
    "explanation": "Sáng 26/1/1954 tại Mường Phăng, chỉ vài giờ trước giờ nổ súng dự kiến, Đại tướng ra \"quyết định khó khăn nhất trong cuộc đời cầm quân\": hoãn tiến công, kéo pháo ra."
  },
  {
    "id": 15,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Cuộc hành binh nhảy dù ngày 20/11/1953 của Pháp đánh chiếm Điện Biên Phủ mang mật danh gì?",
    "options": {
      "A": "Condor (Thần Ưng)",
      "B": "Mouette (Hải Âu)",
      "C": "Castor (Hải Ly)",
      "D": "Vautour (Kền Kền)"
    },
    "answer": "C",
    "explanation": "Cuộc hành binh Castor ngày 20/11/1953 ném 6 tiểu đoàn dù xuống lòng chảo; Mouette là cuộc hành quân trước đó ở Tây Nam Ninh Bình, Condor và Vautour là các kế hoạch giải cứu về sau."
  },
  {
    "id": 16,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Bộ Chính trị quyết định mở Chiến dịch Điện Biên Phủ vào ngày nào?",
    "options": {
      "A": "6/11/1953",
      "B": "3/12/1953",
      "C": "6/12/1953",
      "D": "16/12/1953"
    },
    "answer": "C",
    "explanation": "Ngày 6/12/1953, Bộ Chính trị thông qua kế hoạch mở chiến dịch; còn 3/12/1953 là ngày Navarre quyết định xây dựng Điện Biên Phủ thành tập đoàn cứ điểm."
  },
  {
    "id": 17,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Chiến dịch Điện Biên Phủ được Bộ Tổng tư lệnh đặt mật danh là gì?",
    "options": {
      "A": "Chiến dịch Trần Bình",
      "B": "Chiến dịch Trần Hưng",
      "C": "Chiến dịch Lê Đình",
      "D": "Chiến dịch Trần Đình"
    },
    "answer": "D",
    "explanation": "Để giữ bí mật, mọi văn bản, điện đài của ta đều gọi chiến dịch bằng mật danh \"Trần Đình\"."
  },
  {
    "id": 18,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Tập đoàn cứ điểm Điện Biên Phủ gồm bao nhiêu cứ điểm, được tổ chức thành bao nhiêu trung tâm đề kháng?",
    "options": {
      "A": "49 cứ điểm, 8 trung tâm đề kháng",
      "B": "45 cứ điểm, 8 trung tâm đề kháng",
      "C": "55 cứ điểm, 8 trung tâm đề kháng",
      "D": "49 cứ điểm, 9 trung tâm đề kháng"
    },
    "answer": "A",
    "explanation": "49 cứ điểm hợp thành 8 trung tâm đề kháng (mang tên phụ nữ Pháp), chia làm 3 phân khu: Bắc, Trung tâm và Nam."
  },
  {
    "id": 19,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Trung đoàn pháo cao xạ đầu tiên của ta xuất trận tại Điện Biên Phủ mang phiên hiệu nào, trang bị chủ yếu loại pháo gì?",
    "options": {
      "A": "Trung đoàn 367, pháo cao xạ 57mm",
      "B": "Trung đoàn 367, pháo cao xạ 37mm",
      "C": "Trung đoàn 237, pháo cao xạ 37mm",
      "D": "Trung đoàn 675, súng máy phòng không 12,7mm"
    },
    "answer": "B",
    "explanation": "Trung đoàn 367 với pháo cao xạ 37mm lần đầu xuất trận, khống chế vùng trời, góp phần cắt đứt cầu hàng không của địch."
  },
  {
    "id": 20,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Đại đoàn công pháo (công binh – pháo binh) tham gia chiến dịch mang phiên hiệu nào?",
    "options": {
      "A": "Đại đoàn 355",
      "B": "Đại đoàn 351",
      "C": "Đại đoàn 341",
      "D": "Đại đoàn 350"
    },
    "answer": "B",
    "explanation": "Đại đoàn công pháo 351 gồm các trung đoàn lựu pháo 105mm, sơn pháo, công binh — nắm đấm hỏa lực chủ yếu của chiến dịch."
  },
  {
    "id": 21,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Ai là người chỉ huy tổ xung kích đánh vào hầm chỉ huy và bắt sống tướng De Castries chiều 7/5/1954?",
    "options": {
      "A": "Đại đội trưởng Nguyễn Quốc Trị",
      "B": "Đại đội trưởng Tạ Quốc Luật",
      "C": "Đại đội phó Trần Can",
      "D": "Chiến sĩ Hoàng Đăng Vinh"
    },
    "answer": "B",
    "explanation": "Đại đội trưởng Tạ Quốc Luật (Đại đội 360, Trung đoàn 209, Đại đoàn 312) dẫn tổ xung kích vào hầm lúc 17h30; Hoàng Đăng Vinh là chiến sĩ trong tổ này."
  },
  {
    "id": 22,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Chỉ huy phân khu Nam (cụm cứ điểm Isabelle – Hồng Cúm) của quân Pháp là ai?",
    "options": {
      "A": "Trung tá Jules Gaucher",
      "B": "Trung tá André Lalande",
      "C": "Thiếu tá Marcel Bigeard",
      "D": "Trung tá Pierre Langlais"
    },
    "answer": "B",
    "explanation": "Trung tá André Lalande chỉ huy Isabelle với khoảng 2.000 quân; đêm 7/5 cánh quân này tháo chạy sang Lào và bị bắt gọn."
  },
  {
    "id": 23,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Từ cuối tháng 3/1954, viên sĩ quan nào thực tế nắm quyền điều hành phòng ngự khu trung tâm Mường Thanh thay De Castries?",
    "options": {
      "A": "Đại tá Charles Piroth",
      "B": "Trung tá Pierre Langlais",
      "C": "Thiếu tướng René Cogny",
      "D": "Trung tá André Lalande"
    },
    "answer": "B",
    "explanation": "Từ 24/3/1954, Langlais cùng nhóm sĩ quan dù (trong đó có Bigeard) thực quyền điều hành phòng ngự; Cogny ở tận Hà Nội."
  },
  {
    "id": 24,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Loại hỏa lực mới nào của ta lần đầu tiên xuất trận trong đợt tiến công thứ ba?",
    "options": {
      "A": "Súng cối 120mm",
      "B": "ĐKZ 75mm",
      "C": "Hỏa tiễn H6",
      "D": "Lựu pháo 122mm"
    },
    "answer": "C",
    "explanation": "Dàn hỏa tiễn H6 lần đầu nhả đạn tối 6/5/1954, dội xuống Mường Thanh, gây kinh hoàng cho quân địch trước giờ tổng công kích."
  },
  {
    "id": 25,
    "difficulty": "hard",
    "difficulty_label": "Khó",
    "question": "Cứ điểm đồi Độc Lập bị quân ta tiêu diệt hoàn toàn vào thời điểm nào?",
    "options": {
      "A": "17h30 chiều 15/3/1954",
      "B": "23h30 đêm 13/3/1954",
      "C": "6h30 sáng 14/3/1954",
      "D": "6h30 sáng 15/3/1954"
    },
    "answer": "D",
    "explanation": "Trận đánh nổ ra từ 3h30 rạng sáng 15/3; đến 6h30 cùng ngày ta làm chủ hoàn toàn Độc Lập (23h30 ngày 13/3 là lúc Him Lam bị tiêu diệt)."
  },
  {
    "id": 26,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Chiến dịch Điện Biên Phủ diễn ra qua mấy đợt tiến công?",
    "options": {
      "A": "4 đợt",
      "B": "5 đợt",
      "C": "2 đợt",
      "D": "3 đợt"
    },
    "answer": "D",
    "explanation": "Đợt 1 (13–17/3), đợt 2 (30/3–30/4) và đợt 3 (1/5–7/5/1954)."
  },
  {
    "id": 27,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Mục tiêu chủ yếu của đợt tiến công thứ nhất (13–17/3/1954) là gì?",
    "options": {
      "A": "Đánh chiếm dãy cao điểm phía Đông phân khu trung tâm",
      "B": "Tiêu diệt Him Lam và toàn bộ phân khu Bắc (Độc Lập, Bản Kéo)",
      "C": "Đánh thẳng vào sở chỉ huy De Castries ở Mường Thanh",
      "D": "Tiêu diệt cụm cứ điểm Hồng Cúm ở phía Nam"
    },
    "answer": "B",
    "explanation": "Chỉ trong 5 ngày, ta đập tan \"cánh cửa thép\" phía Bắc: Him Lam (13/3), Độc Lập (15/3), Bản Kéo (17/3)."
  },
  {
    "id": 28,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Trận mở màn chiến dịch nhằm vào trung tâm đề kháng nào?",
    "options": {
      "A": "Him Lam",
      "B": "Độc Lập",
      "C": "Hồng Cúm",
      "D": "Bản Kéo"
    },
    "answer": "A",
    "explanation": "Him Lam — cụm cứ điểm mạnh nhất, được mệnh danh \"cánh cửa thép\" án ngữ hướng Tuần Giáo vào lòng chảo — bị tiêu diệt ngay trong đêm 13/3."
  },
  {
    "id": 29,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Điều đặc biệt gì xảy ra ở cứ điểm Bản Kéo ngày 17/3/1954?",
    "options": {
      "A": "Địch phản kích chiếm lại rồi mới bị tiêu diệt hẳn",
      "B": "Ta phải cường tập suốt 5 giờ trong đêm mới chiếm được",
      "C": "Địch rút chạy sau ba ngày bị pháo kích liên tục",
      "D": "Binh lính địch kéo cờ trắng ra hàng, ta chiếm cứ điểm mà không phải mở trận công kiên"
    },
    "answer": "D",
    "explanation": "Bị vây ép và địch vận, tiểu đoàn lính ngụy Thái ở Bản Kéo bỏ vị trí ra hàng; Trung đoàn 36 (Đại đoàn 308) chiếm cứ điểm gần như không tốn một viên đạn."
  },
  {
    "id": 30,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Đợt tiến công thứ hai của chiến dịch mở màn vào thời gian nào?",
    "options": {
      "A": "Tối 25/3/1954",
      "B": "Sáng 1/4/1954",
      "C": "Tối 20/3/1954",
      "D": "Tối 30/3/1954"
    },
    "answer": "D",
    "explanation": "18h ngày 30/3/1954, ta đồng loạt tiến công dãy cao điểm phía Đông, mở đầu đợt 2 — đợt dài và ác liệt nhất chiến dịch."
  },
  {
    "id": 31,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Hướng đánh chủ yếu trong đợt tiến công thứ hai là khu vực nào?",
    "options": {
      "A": "Dãy cao điểm phía Đông phân khu trung tâm (E1, D1, C1, A1...)",
      "B": "Khu hầm ngầm sở chỉ huy De Castries",
      "C": "Các cứ điểm phía Tây sân bay Mường Thanh",
      "D": "Cụm cứ điểm Hồng Cúm ở phía Nam"
    },
    "answer": "A",
    "explanation": "Ai làm chủ dãy đồi phía Đông sẽ khống chế toàn bộ lòng chảo — vì vậy nơi đây trở thành chiến trường đẫm máu nhất."
  },
  {
    "id": 32,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Ngọn đồi nào diễn ra cuộc giành giật dai dẳng, ác liệt nhất chiến dịch, kéo dài tới 39 ngày đêm?",
    "options": {
      "A": "Đồi C1",
      "B": "Đồi E1",
      "C": "Đồi A1",
      "D": "Đồi D1"
    },
    "answer": "C",
    "explanation": "A1 là \"chìa khóa\" của cả tập đoàn cứ điểm; ta và địch giành nhau từng thước hào từ 30/3 đến rạng sáng 7/5/1954."
  },
  {
    "id": 33,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Anh hùng Phan Đình Giót lập chiến công gì, trong trận đánh nào?",
    "options": {
      "A": "Ôm bộc phá đánh sập hầm ngầm đồi A1",
      "B": "Lấy thân mình chèn pháo trên dốc Chuối",
      "C": "Lấy vai làm giá súng trong trận Mường Pồn",
      "D": "Lấy thân mình lấp lỗ châu mai trong trận Him Lam"
    },
    "answer": "D",
    "explanation": "Tối 13/3/1954 tại Him Lam, Phan Đình Giót lao cả thân mình bịt lỗ châu mai, dập tắt hỏa điểm địch cho đơn vị xung phong."
  },
  {
    "id": 34,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Anh hùng Tô Vĩnh Diện hy sinh trong hoàn cảnh nào?",
    "options": {
      "A": "Lấy thân mình lấp lỗ châu mai ở đồi Độc Lập",
      "B": "Lấy thân mình chèn cứu khẩu pháo cao xạ 37mm đang lao xuống dốc khi kéo pháo ra",
      "C": "Ôm bộc phá mở cửa đột phá ở Him Lam",
      "D": "Lấy vai làm giá súng máy cho đồng đội bắn"
    },
    "answer": "B",
    "explanation": "Đêm 1/2/1954 trên dốc Chuối, dây tời đứt, Tô Vĩnh Diện lao vào chèn bánh pháo, hy sinh để cứu khẩu pháo cao xạ 37mm."
  },
  {
    "id": 35,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Anh hùng Bế Văn Đàn đã lập chiến công gì?",
    "options": {
      "A": "Lấy vai làm giá súng máy cho đồng đội bắn trong trận Mường Pồn",
      "B": "Lấy thân mình chèn pháo khi kéo pháo qua dốc",
      "C": "Cắm cờ Quyết chiến Quyết thắng lên lô cốt Him Lam",
      "D": "Lấy thân mình lấp lỗ châu mai ở Hồng Cúm"
    },
    "answer": "A",
    "explanation": "Tháng 12/1953 tại Mường Pồn (đợt tác chiến tạo thế cho chiến dịch), Bế Văn Đàn ghì hai chân súng máy lên vai mình và hy sinh trong tư thế đó."
  },
  {
    "id": 36,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Ai là người cắm lá cờ \"Quyết chiến, Quyết thắng\" lên lô cốt cứ điểm Him Lam ngay trận mở màn?",
    "options": {
      "A": "Trần Can",
      "B": "Chu Văn Mùi",
      "C": "Phan Đình Giót",
      "D": "Tạ Quốc Luật"
    },
    "answer": "A",
    "explanation": "Trần Can dẫn tiểu đội thọc sâu cắm cờ trên lô cốt Him Lam đêm 13/3; anh hy sinh đúng sáng 7/5/1954 — ngày chiến dịch toàn thắng."
  },
  {
    "id": 37,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Chiến thuật nổi bật của quân ta trong đợt 2 và đợt 3 của chiến dịch là gì?",
    "options": {
      "A": "Dùng đặc công luồn sâu đánh hiểm ban đêm là chủ yếu",
      "B": "Nghi binh ở phía Bắc, đột phá bất ngờ từ phía Nam",
      "C": "\"Vây, lấn, tấn, diệt\" — đào giao thông hào siết chặt, bóp nghẹt từng cứ điểm",
      "D": "\"Đánh nhanh, giải quyết nhanh\" bằng xung phong ồ ạt"
    },
    "answer": "C",
    "explanation": "Hàng trăm km chiến hào như những \"chiếc thòng lọng\" ngày đêm lấn dần, chia cắt và siết chặt tập đoàn cứ điểm."
  },
  {
    "id": 38,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Vì sao việc khống chế sân bay Mường Thanh có ý nghĩa quyết định đối với chiến dịch?",
    "options": {
      "A": "Cắt đứt cầu hàng không — nguồn tiếp tế và tăng viện duy nhất của quân địch",
      "B": "Chiếm được kho xăng dầu lớn nhất của địch",
      "C": "Ngăn xe tăng địch cơ động ra phản kích",
      "D": "Mở đường cho pháo binh ta tiến vào khu trung tâm"
    },
    "answer": "A",
    "explanation": "Điện Biên Phủ hoàn toàn cô lập về đường bộ; mất sân bay, 16.000 quân địch chỉ còn trông vào dù thả — ngày càng đói đạn, đói ăn."
  },
  {
    "id": 39,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Khi sân bay bị khống chế, quân Pháp tiếp tế bằng cách nào và hậu quả ra sao?",
    "options": {
      "A": "Ngừng hẳn tiếp tế để dồn sức cho không kích",
      "B": "Dùng trực thăng đáp xuống ban đêm ở Hồng Cúm",
      "C": "Thả dù; do vòng vây quá hẹp, rất nhiều kiện hàng rơi vào trận địa của ta",
      "D": "Mở đường bộ từ Thượng Lào sang ứng cứu thành công"
    },
    "answer": "C",
    "explanation": "Máy bay phải bay cao thả dù vì lưới lửa cao xạ; đạn pháo 105mm, lương thực, thậm chí cả lon Thiếu tướng của De Castries cũng rơi sang phía ta."
  },
  {
    "id": 40,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Trong chiến dịch, ta đã huy động khoảng bao nhiêu chiếc xe đạp thồ phục vụ vận chuyển?",
    "options": {
      "A": "Gần 21.000 chiếc",
      "B": "Gần 12.000 chiếc",
      "C": "Gần 8.000 chiếc",
      "D": "Gần 31.000 chiếc"
    },
    "answer": "A",
    "explanation": "Gần 21.000 xe đạp thồ — được báo chí phương Tây gọi là \"vũ khí bí mật\" của Việt Minh — nối hậu phương với mặt trận."
  },
  {
    "id": 41,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Có khoảng bao nhiêu lượt dân công hỏa tuyến được huy động phục vụ chiến dịch?",
    "options": {
      "A": "Hơn 620.000 lượt người",
      "B": "Khoảng 62.000 lượt người",
      "C": "Khoảng 160.000 lượt người",
      "D": "Hơn 260.000 lượt người"
    },
    "answer": "D",
    "explanation": "Chính xác là 261.451 lượt dân công với hơn 18 triệu ngày công, vận chuyển hơn 25.000 tấn lương thực, đạn dược."
  },
  {
    "id": 42,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Kỷ lục vận chuyển bằng xe đạp thồ trong chiến dịch thuộc về ai, với khối lượng bao nhiêu?",
    "options": {
      "A": "Ma Văn Thắng — 352 kg/chuyến",
      "B": "Ma Văn Thắng — 252 kg/chuyến",
      "C": "Cao Văn Tỵ — 352 kg/chuyến",
      "D": "Trịnh Đình Bầm — 320 kg/chuyến"
    },
    "answer": "A",
    "explanation": "Dân công Ma Văn Thắng (Phú Thọ) lập kỷ lục thồ 352 kg mỗi chuyến — gấp hơn 10 lần sức mang vác của một người lính."
  },
  {
    "id": 43,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "\"Bếp Hoàng Cầm\" — sáng kiến nổi tiếng trong chiến dịch — có tác dụng gì?",
    "options": {
      "A": "Cho phép nấu ăn dưới hầm sâu 10 mét",
      "B": "Tận dụng than không khói thu được của địch",
      "C": "Giúp nấu nhanh gấp đôi, tiết kiệm một nửa củi",
      "D": "Làm loãng và giấu khói khi nấu ăn, tránh máy bay địch phát hiện"
    },
    "answer": "D",
    "explanation": "Bếp có hệ thống rãnh thoát khói tỏa qua các bụi cây ẩm, khói bị lọc và tan sát mặt đất — bộ đội nấu ăn ngay gần trận địa mà địch không phát hiện được."
  },
  {
    "id": 44,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Phương châm tác chiến ban đầu của ta ở Điện Biên Phủ — trước khi được thay đổi — là gì?",
    "options": {
      "A": "\"Đánh nhanh, giải quyết nhanh\"",
      "B": "\"Đánh chắc, tiến chắc\"",
      "C": "\"Đánh điểm, diệt viện\"",
      "D": "\"Vây thành, diệt viện\""
    },
    "answer": "A",
    "explanation": "Kế hoạch ban đầu dự định tổng công kích tiêu diệt tập đoàn cứ điểm trong 2 ngày 3 đêm, sau được đổi thành \"đánh chắc, tiến chắc\"."
  },
  {
    "id": 45,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Sự kiện \"kéo pháo ra\" đầu năm 1954 gắn liền với điều gì?",
    "options": {
      "A": "Kế nghi binh làm địch tưởng ta rút quân khỏi mặt trận",
      "B": "Nhường đường cho đoàn xe vận tải chở gạo vào chiến dịch",
      "C": "Pháo bị hỏng hàng loạt phải đưa về tuyến sau sửa chữa",
      "D": "Việc thay đổi phương châm sang \"đánh chắc, tiến chắc\" — pháo được kéo ra để chuẩn bị lại trận địa"
    },
    "answer": "D",
    "explanation": "Hàng ngàn chiến sĩ lại ghì dây tời kéo những khẩu pháo hơn 2 tấn ra khỏi trận địa hoàn toàn bằng sức người — sự kiện đi vào bài hát \"Hò kéo pháo\"."
  },
  {
    "id": 46,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Đợt tiến công thứ ba của chiến dịch diễn ra trong khoảng thời gian nào?",
    "options": {
      "A": "Từ 1/5 đến 10/5/1954",
      "B": "Từ 1/5 đến 7/5/1954",
      "C": "Từ 28/4 đến 5/5/1954",
      "D": "Từ 26/4 đến 7/5/1954"
    },
    "answer": "B",
    "explanation": "Đợt 3 là đợt tổng công kích: ta lần lượt nhổ các cứ điểm còn lại và kết thúc chiến dịch chiều tối 7/5/1954."
  },
  {
    "id": 47,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Tối 6/5/1954, hiệu lệnh tổng công kích trên hướng đồi A1 là gì?",
    "options": {
      "A": "Loạt đạn pháo 105mm bắn cấp tập vào Mường Thanh",
      "B": "Hồi kèn xung trận vang lên trên toàn mặt trận",
      "C": "Tiếng nổ của khối bộc phá gần 1 tấn trong lòng đồi A1",
      "D": "Ba phát pháo hiệu màu đỏ bắn lên từ Mường Phăng"
    },
    "answer": "C",
    "explanation": "20h30 ngày 6/5, khối bộc phá 960 kg nổ rung chuyển đồi A1 — vừa tiêu diệt hầm ngầm địch, vừa là hiệu lệnh tiến công."
  },
  {
    "id": 48,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Chiến dịch Điện Biên Phủ kết thúc hoàn toàn khi nào, với sự kiện gì?",
    "options": {
      "A": "Chiều 6/5/1954, khi đồi A1 thất thủ",
      "B": "Sáng 8/5/1954, khi quân Pháp ký văn bản đầu hàng",
      "C": "Đêm 7/5/1954, khi toàn bộ quân địch ở Hồng Cúm tháo chạy và bị bắt gọn",
      "D": "Trưa 7/5/1954, khi lá cờ được cắm trên hầm De Castries"
    },
    "answer": "C",
    "explanation": "17h30 ngày 7/5 ta bắt sống De Castries; đến 24h cùng ngày, cánh quân Hồng Cúm định chạy sang Lào bị bắt toàn bộ — chiến dịch toàn thắng."
  },
  {
    "id": 49,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Sở chỉ huy Chiến dịch Điện Biên Phủ của ta đặt tại đâu?",
    "options": {
      "A": "Mường Phăng",
      "B": "Tuần Giáo",
      "C": "Nà Sản",
      "D": "Mường Thanh"
    },
    "answer": "A",
    "explanation": "Sở chỉ huy đặt trong khu rừng Mường Phăng, cách lòng chảo khoảng 30 km đường bộ — nơi có căn hầm xuyên núi nổi tiếng của Bộ chỉ huy."
  },
  {
    "id": 50,
    "difficulty": "medium",
    "difficulty_label": "Trung bình",
    "question": "Đại đoàn 308 — một trong các đại đoàn chủ lực tham gia chiến dịch — mang danh hiệu truyền thống nào?",
    "options": {
      "A": "Chiến Thắng",
      "B": "Đồng Bằng",
      "C": "Vinh Quang",
      "D": "Quân Tiên Phong"
    },
    "answer": "D",
    "explanation": "Đại đoàn 308 \"Quân Tiên Phong\" là đại đoàn chủ lực đầu tiên của Quân đội ta; \"Chiến Thắng\" là danh hiệu của Đại đoàn 312."
  },
  {
    "id": 51,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Chiến dịch Điện Biên Phủ diễn ra vào năm nào?",
    "options": {
      "A": "1955",
      "B": "1953",
      "C": "1954",
      "D": "1952"
    },
    "answer": "C",
    "explanation": "Chiến dịch diễn ra từ ngày 13/3 đến 7/5/1954."
  },
  {
    "id": 52,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Ai là Tư lệnh kiêm Bí thư Đảng ủy Mặt trận Điện Biên Phủ?",
    "options": {
      "A": "Đại tướng Nguyễn Chí Thanh",
      "B": "Thiếu tướng Hoàng Văn Thái",
      "C": "Đại tướng Võ Nguyên Giáp",
      "D": "Đại tướng Văn Tiến Dũng"
    },
    "answer": "C",
    "explanation": "Đại tướng Võ Nguyên Giáp trực tiếp chỉ huy chiến dịch; Hoàng Văn Thái là Tham mưu trưởng chiến dịch."
  },
  {
    "id": 53,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Viên tướng nào chỉ huy tập đoàn cứ điểm Điện Biên Phủ của quân Pháp?",
    "options": {
      "A": "René Cogny (Cô-nhi)",
      "B": "Christian de Castries (Đờ Cát-xtơ-ri)",
      "C": "Henri Navarre (Na-va)",
      "D": "De Lattre de Tassigny (Đờ Lát)"
    },
    "answer": "B",
    "explanation": "De Castries chỉ huy tại chỗ; Navarre là Tổng chỉ huy Đông Dương, Cogny chỉ huy Bắc Bộ, còn De Lattre đã rời Đông Dương từ 1952."
  },
  {
    "id": 54,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Điện Biên Phủ ngày nay thuộc tỉnh nào của Việt Nam?",
    "options": {
      "A": "Sơn La",
      "B": "Lai Châu",
      "C": "Lào Cai",
      "D": "Điện Biên"
    },
    "answer": "D",
    "explanation": "Năm 1954, Điện Biên Phủ thuộc tỉnh Lai Châu; từ năm 2004 tách ra thành tỉnh Điện Biên."
  },
  {
    "id": 55,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Chiến dịch Điện Biên Phủ kéo dài bao nhiêu ngày đêm?",
    "options": {
      "A": "60 ngày đêm",
      "B": "56 ngày đêm",
      "C": "45 ngày đêm",
      "D": "55 ngày đêm"
    },
    "answer": "B",
    "explanation": "\"Năm mươi sáu ngày đêm khoét núi, ngủ hầm, mưa dầm, cơm vắt...\" (thơ Tố Hữu)."
  },
  {
    "id": 56,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Chiến dịch Điện Biên Phủ toàn thắng vào ngày nào?",
    "options": {
      "A": "7/5/1954",
      "B": "7/4/1954",
      "C": "1/5/1954",
      "D": "19/5/1954"
    },
    "answer": "A",
    "explanation": "Chiều 7/5/1954, lá cờ \"Quyết chiến, Quyết thắng\" tung bay trên nóc hầm De Castries; ngày 7/5 trở thành ngày kỷ niệm Chiến thắng Điện Biên Phủ."
  },
  {
    "id": 57,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Chiến dịch Điện Biên Phủ mở màn vào ngày nào?",
    "options": {
      "A": "13/3/1954",
      "B": "30/3/1954",
      "C": "13/4/1954",
      "D": "20/11/1953"
    },
    "answer": "A",
    "explanation": "Ngày 13/3/1954 ta nổ súng đánh Him Lam; còn 20/11/1953 là ngày Pháp nhảy dù chiếm Điện Biên Phủ."
  },
  {
    "id": 58,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Câu thơ \"Lừng lẫy năm châu, chấn động địa cầu\" ca ngợi chiến thắng Điện Biên Phủ là của nhà thơ nào?",
    "options": {
      "A": "Chính Hữu",
      "B": "Tố Hữu",
      "C": "Xuân Diệu",
      "D": "Chế Lan Viên"
    },
    "answer": "B",
    "explanation": "Câu thơ trong bài \"Hoan hô chiến sĩ Điện Biên\" của Tố Hữu, sáng tác tháng 5/1954."
  },
  {
    "id": 59,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Thất bại ở Điện Biên Phủ buộc thực dân Pháp phải ký hiệp định nào?",
    "options": {
      "A": "Hiệp định Paris (Pa-ri)",
      "B": "Tạm ước Fontainebleau (Phông-ten-nơ-blô)",
      "C": "Hiệp định Genève (Giơ-ne-vơ)",
      "D": "Hiệp định Élysée (Ê-ly-dê)"
    },
    "answer": "C",
    "explanation": "Hiệp định Genève về đình chỉ chiến sự ở Đông Dương được ký ngày 21/7/1954, công nhận độc lập, chủ quyền, thống nhất và toàn vẹn lãnh thổ của Việt Nam."
  },
  {
    "id": 60,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Ai là Tổng chỉ huy quân viễn chinh Pháp ở Đông Dương trong thời gian diễn ra chiến dịch?",
    "options": {
      "A": "Raoul Salan (Xa-lăng)",
      "B": "De Lattre de Tassigny (Đờ Lát)",
      "C": "René Cogny (Cô-nhi)",
      "D": "Henri Navarre (Na-va)"
    },
    "answer": "D",
    "explanation": "Tướng Navarre sang Đông Dương tháng 5/1953, tác giả của kế hoạch quân sự mang tên ông."
  },
  {
    "id": 61,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Chiến thắng Điện Biên Phủ đã làm phá sản hoàn toàn kế hoạch quân sự nào của Pháp – Mỹ?",
    "options": {
      "A": "Kế hoạch Rơve (Revers)",
      "B": "Kế hoạch Đờ Lát (De Lattre)",
      "C": "Kế hoạch Xa-lăng (Salan)",
      "D": "Kế hoạch Nava (Navarre)"
    },
    "answer": "D",
    "explanation": "Kế hoạch Navarre (1953) hy vọng \"chuyển bại thành thắng\" trong 18 tháng — và đã bị chôn vùi tại lòng chảo Điện Biên."
  },
  {
    "id": 62,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Trước khi lên đường ra mặt trận, Đại tướng Võ Nguyên Giáp được Chủ tịch Hồ Chí Minh căn dặn điều gì?",
    "options": {
      "A": "\"Trận này rất quan trọng, phải đánh cho thắng. Chắc thắng mới đánh, không chắc thắng không đánh\"",
      "B": "\"Dĩ bất biến, ứng vạn biến\"",
      "C": "\"Thần tốc, thần tốc hơn nữa, táo bạo, táo bạo hơn nữa\"",
      "D": "\"Đánh nhanh, thắng nhanh để còn kịp về đón Tết\""
    },
    "answer": "A",
    "explanation": "Bác còn dặn: \"Tướng quân tại ngoại, trao cho chú toàn quyền quyết định\"; câu \"Thần tốc...\" là mệnh lệnh năm 1975."
  },
  {
    "id": 63,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Tập đoàn cứ điểm Điện Biên Phủ nằm trên cánh đồng lòng chảo nào?",
    "options": {
      "A": "Mường Phăng",
      "B": "Mường Thanh",
      "C": "Mường Tấc",
      "D": "Mường Lò"
    },
    "answer": "B",
    "explanation": "Cánh đồng Mường Thanh — \"nhất Thanh, nhì Lò, tam Than, tứ Tấc\" — là cánh đồng lớn nhất Tây Bắc, dài khoảng 18 km."
  },
  {
    "id": 64,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Kết thúc chiến dịch, quân ta đã loại khỏi vòng chiến đấu khoảng bao nhiêu quân địch?",
    "options": {
      "A": "26.000 quân",
      "B": "10.000 quân",
      "C": "16.200 quân",
      "D": "6.200 quân"
    },
    "answer": "C",
    "explanation": "Toàn bộ 16.200 quân địch tại tập đoàn cứ điểm bị tiêu diệt hoặc bắt sống, trong đó có 1 thiếu tướng và toàn bộ Bộ tham mưu."
  },
  {
    "id": 65,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Số phận của tướng De Castries vào chiều ngày 7/5/1954 ra sao?",
    "options": {
      "A": "Tự sát trong hầm chỉ huy",
      "B": "Bị bắt sống tại hầm chỉ huy cùng toàn bộ Bộ tham mưu",
      "C": "Tử trận trong đợt pháo kích cuối cùng",
      "D": "Lên máy bay trốn thoát sang Thượng Lào"
    },
    "answer": "B",
    "explanation": "17h30 ngày 7/5/1954, tổ xung kích của Tạ Quốc Luật tiến vào hầm, bắt sống De Castries cùng toàn bộ Bộ tham mưu tập đoàn cứ điểm."
  },
  {
    "id": 66,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Lá cờ tung bay trên nóc hầm De Castries chiều 7/5/1954 mang dòng chữ gì?",
    "options": {
      "A": "\"Quyết chiến, Quyết thắng\"",
      "B": "\"Không có gì quý hơn độc lập tự do\"",
      "C": "\"Quyết tử cho Tổ quốc quyết sinh\"",
      "D": "\"Độc lập, Tự do\""
    },
    "answer": "A",
    "explanation": "Đó là lá cờ thi đua \"Quyết chiến, Quyết thắng\" của Chủ tịch Hồ Chí Minh trao cho các đơn vị lập công."
  },
  {
    "id": 67,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Trước trận đánh, giới quân sự Pháp – Mỹ huênh hoang coi Điện Biên Phủ là gì?",
    "options": {
      "A": "\"Tuyến phòng thủ số 2 sau Nà Sản\"",
      "B": "\"Pháo đài bất khả xâm phạm\"",
      "C": "\"Tiền đồn tạm thời ở Tây Bắc\"",
      "D": "\"Căn cứ hậu cần lớn nhất Đông Dương\""
    },
    "answer": "B",
    "explanation": "Địch coi đây là \"pháo đài bất khả xâm phạm\", \"cối xay thịt nghiền nát Việt Minh\" — và sẵn sàng \"nghênh đón\" chủ lực ta."
  },
  {
    "id": 68,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Ý nghĩa lớn nhất của chiến thắng Điện Biên Phủ đối với Việt Nam là gì?",
    "options": {
      "A": "Mở đầu cuộc kháng chiến chống Mỹ cứu nước",
      "B": "Buộc Mỹ chấm dứt chiến tranh phá hoại miền Bắc",
      "C": "Giải phóng hoàn toàn miền Nam, thống nhất đất nước",
      "D": "Kết thúc thắng lợi 9 năm kháng chiến chống thực dân Pháp"
    },
    "answer": "D",
    "explanation": "Chiến thắng quyết định buộc Pháp ký Hiệp định Genève, chấm dứt cuộc chiến tranh xâm lược kéo dài 9 năm (1945–1954)."
  },
  {
    "id": 69,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Phương tiện vận chuyển thô sơ nào đã trở thành \"huyền thoại\" trong công tác hậu cần của chiến dịch?",
    "options": {
      "A": "Thuyền độc mộc",
      "B": "Xe trâu kéo",
      "C": "Ngựa thồ",
      "D": "Xe đạp thồ"
    },
    "answer": "D",
    "explanation": "Những chiếc xe đạp thồ được gia cố có thể chở hàng trăm kg, khiến báo chí phương Tây kinh ngạc gọi là \"vũ khí bí mật\" của Việt Minh."
  },
  {
    "id": 70,
    "difficulty": "easy",
    "difficulty_label": "Dễ",
    "question": "Thung lũng Điện Biên Phủ nằm sát biên giới Việt Nam với nước nào?",
    "options": {
      "A": "Trung Quốc",
      "B": "Thái Lan",
      "C": "Campuchia",
      "D": "Lào"
    },
    "answer": "D",
    "explanation": "Lòng chảo Điện Biên chỉ cách biên giới Việt – Lào khoảng 30 km (cửa khẩu Tây Trang), án ngữ ngã ba chiến lược Tây Bắc – Thượng Lào."
  }
]);
})(window.DuongToiChienThang = window.DuongToiChienThang || {});
