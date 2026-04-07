from flask import Flask, jsonify, render_template, request, session
from agent import graph

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = "travelbuddy_secret_key_2024"  # Cần thiết cho session


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

    # Invoke graph với toàn bộ history
    result = graph.invoke({"messages": messages})
    final = result["messages"][-1]
    content = getattr(final, "content", str(final))

    # Thêm response của assistant vào history
    messages.append(("assistant", content))

    # Lưu lại history vào session
    session["chat_history"] = messages

    return jsonify({"reply": content})


@app.route("/api/clear", methods=["POST"])
def clear_chat():
    session.pop("chat_history", None)
    return jsonify({"status": "cleared"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
