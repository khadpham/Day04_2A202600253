# Day04: Prompt Engineering with LangGraph

Dự án này là phần thực hành của khóa học AI, tập trung vào việc xây dựng agent sử dụng LangGraph cho kỹ thuật prompt engineering.

## Mô tả

Dự án bao gồm việc triển khai một agent đơn giản sử dụng LangGraph để xử lý các tác vụ liên quan đến prompt engineering. Agent có thể tương tác với API và sử dụng các công cụ được định nghĩa trong `tools.py`.

## Cấu trúc dự án

- `lab4_agent/`: Thư mục chính chứa mã nguồn
  - `agent.py`: File chính định nghĩa agent
  - `system_prompt.txt`: Prompt hệ thống cho agent
  - `test_api.py`: Script test API
  - `tools.py`: Định nghĩa các công cụ cho agent
- `requirements.txt`: Danh sách dependencies
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

## Yêu cầu

- Python 3.8+
- LangGraph

## Tác giả

Pham Khad - 2A202600253