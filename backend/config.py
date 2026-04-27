import os
from dotenv import load_dotenv

load_dotenv()

# 阿里云百炼配置
API_BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1"
API_KEY = os.getenv("DASHSCOPE_API_KEY", "sk-607755f71e294bb190fe52169e36f9ac")
MODEL = "qwen-turbo"  # 免费额度更充足

# CORS 配置
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite 开发服务器
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    # 上线后添加你的域名
]

# 对话配置
MAX_HISTORY_LENGTH = 20  # 最大对话轮次
MAX_TOKENS = 500  # 最大回复长度
TEMPERATURE = 0.7  # 创造性参数（0-1）
