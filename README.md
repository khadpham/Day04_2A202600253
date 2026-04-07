# Day04: Prompt Engineering with LangGraph

Dự án này là phần thực hành của khóa học AI, tập trung vào việc xây dựng agent sử dụng LangGraph cho kỹ thuật prompt engineering.

## Mô tả

Dự án bao gồm việc triển khai một agent đơn giản sử dụng LangGraph để xử lý các tác vụ liên quan đến prompt engineering. Agent có thể tương tác với API và sử dụng các công cụ được định nghĩa trong `tools.py`.

## Cấu trúc dự án

- `lab4_agent/`: Thư mục chính chứa mã nguồn
  - `agent.py`: File chính định nghĩa agent
  - `system_prompt.txt`: Prompt hệ thống cho agent
  - `test_api.py`: Script test API
  - `test_results.md`: Kết quả và log kiểm thử chi tiết
  - `tools.py`: Định nghĩa các công cụ cho agent
- `requirements.txt`: Danh sách dependencies
- `README.md`: Tài liệu hướng dẫn dự án
- `.gitignore`: File ignore cho Git

## Cài đặt

1. Clone repository:
   ```bash
   git clone https://github.com/khadpham/Day04_2A202600253.git
   cd Day04_2A202600253
   ```

2. Cài đặt dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Cách chạy

1. Chạy agent:
   ```bash
   python lab4_agent/agent.py
   ```

2. Test API:
   ```bash
   python lab4_agent/test_api.py
   ```

## Kết quả Kiểm thử

Chi tiết về các test case, log thực hiện và kết quả có thể xem tại file [lab4_agent/test_results.md](lab4_agent/test_results.md). Bao gồm:
- Test 1: Direct Answer (Không cần tool)
- Test 2: Single Tool Call (Gọi 1 công cụ)
- Test 3: Multi-Step Tool Chaining (Kết hợp nhiều công cụ)
- Test 4: Missing Info / Clarification (Xử lý thiếu thông tin)
- Test 5: Guardrail / Refusal (Xử lý Egde case, ngoài boundary công cụ)

## Yêu cầu

- Python 3.8+
- LangGraph

## Tác giả

Pham Dan Kha - 2A202600253