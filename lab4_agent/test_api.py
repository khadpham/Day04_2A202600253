import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# 1. Load biến môi trường
load_dotenv()
github_token = os.getenv("GITHUB_TOKEN")

# 2. Khởi tạo model qua GitHub Endpoint
# Lưu ý: model_name có thể là "gpt-4o" hoặc "gpt-4o-mini" tùy vào quyền hạn GitHub của bạn
llm = ChatOpenAI(
    model="gpt-4o-mini",
    openai_api_key=github_token,
    openai_api_base="https://models.inference.ai.azure.com",
)

# 3. Sanity Check (Kiểm tra thử)
try:
    response = llm.invoke("Xin chào, bạn là ai?")
    print("--- Kết nối thành công! ---")
    print(f"Agent trả lời: {response.content}")
except Exception as e:
    print(f"Lỗi kết nối: {e}")
