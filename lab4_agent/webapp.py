from flask import Flask, jsonify, render_template, request, session
from agent import graph
import io
import sys
from contextlib import redirect_stdout
import os

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = "travelbuddy_secret_key_2024"  # Cần thiết cho session

# Kiểm tra GITHUB_TOKEN
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
if not GITHUB_TOKEN:
    print("\n⚠️  CẢNH BÁO: GITHUB_TOKEN không được cấu hình!")
    print("Vui lòng tạo file .env với nội dung:")
    print("  GITHUB_TOKEN=your_token_here")
    print("Lấy token từ: https://github.com/settings/tokens\n")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat_api():
    payload = request.get_json(silent=True) or {}
    user_message = payload.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Vui lòng nhập nội dung câu hỏi."}), 400

    # Lấy lịch sử hội thoại từ session
    messages = session.get("chat_history", [])

    # Thêm message mới của user
    messages.append(("human", user_message))

    # Capture logs từ agent (những dòng có [LOG])
    log_capture = io.StringIO()

    # Tạo custom stdout để capture logs [LOG] nhưng vẫn hiển thị terminal
    class LogCapture:
        def __init__(self, capture_stream):
            self.capture_stream = capture_stream
            self.original_stdout = sys.stdout

        def write(self, text):
            # Viết ra terminal như bình thường
            self.original_stdout.write(text)
            # Capture những dòng có [LOG]
            if "[LOG]" in text:
                self.capture_stream.write(text)

        def flush(self):
            self.original_stdout.flush()

    try:
        # Sử dụng custom stdout capture
        custom_stdout = LogCapture(log_capture)
        with redirect_stdout(custom_stdout):
            # Invoke graph với toàn bộ history
            result = graph.invoke({"messages": messages})

        final = result["messages"][-1]
        content = getattr(final, "content", str(final))
        logs = log_capture.getvalue()

        # Thêm response của assistant vào history
        messages.append(("assistant", content))

        # Lưu lại history vào session
        session["chat_history"] = messages

        # Parse logs để hiển thị timeline
        timeline = parse_execution_logs(logs)

        return jsonify({"reply": content, "timeline": timeline, "logs": logs.strip()})
    except Exception as e:
        logs = log_capture.getvalue()
        error_msg = str(e)

        # Cung cấp hint nếu là lỗi authentication
        if (
            "401" in error_msg
            or "authentication" in error_msg.lower()
            or "api_key" in error_msg.lower()
        ):
            error_msg = "Lỗi xác thực API. Vui lòng kiểm tra GITHUB_TOKEN trong file .env. Hãy nhấn Ctrl+C để dừng server, cấu hình .env, rồi chạy lại."
        elif "connection" in error_msg.lower() or "timeout" in error_msg.lower():
            error_msg = "Lỗi kết nối đến API. Kiểm tra kết nối internet hoặc API endpoint cấu hình."

        return jsonify({"error": error_msg, "logs": logs.strip()}), 500


def parse_execution_logs(logs):
    """Parse logs từ LangGraph execution để tạo timeline"""
    timeline = []
    step_num = 1

    for line in logs.split("\n"):
        line = line.strip()
        if not line:
            continue

        if "[LOG] Gọi tool:" in line:
            tool_info = line.replace("[LOG] Gọi tool:", "").strip()
            timeline.append(
                {
                    "step": step_num,
                    "type": "tool_call",
                    "label": f"Gọi công cụ",
                    "details": tool_info,
                }
            )
            step_num += 1
        elif "[LOG] Trả lời trực tiếp" in line:
            timeline.append(
                {
                    "step": step_num,
                    "type": "direct_reply",
                    "label": "Trả lời trực tiếp",
                    "details": "Không cần công cụ",
                }
            )
            step_num += 1

    return timeline


@app.route("/api/clear", methods=["POST"])
def clear_chat():
    session.pop("chat_history", None)
    return jsonify({"status": "cleared"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
