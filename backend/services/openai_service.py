"""
AI 服务 - 封装 OpenAI 兼容接口
"""

from openai import OpenAI, APIError
from config import API_BASE, API_KEY, MODEL, MAX_TOKENS, TEMPERATURE
import logging

logger = logging.getLogger(__name__)

# 初始化客户端
client = OpenAI(
    api_key=API_KEY,
    base_url=API_BASE,
    timeout=60.0
)


def get_ai_response(messages: list) -> str:
    """
    调用 AI 获取回复

    Args:
        messages: 对话消息列表，格式为 [{"role": "user"/"assistant"/"system", "content": "..."}]

    Returns:
        AI 的回复文本

    Raises:
        APIError: API 调用失败时抛出
    """
    if not API_KEY:
        raise APIError("API Key 未配置，请在 .env 文件中设置 SILICON_API_KEY")

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS
        )
        return response.choices[0].message.content

    except APIError as e:
        logger.error(f"AI API 调用失败: {e}")
        raise
    except Exception as e:
        logger.error(f"未知错误: {e}")
        raise APIError(f"服务异常: {str(e)}")


def check_api_health() -> bool:
    """检查 API 连接是否正常"""
    try:
        test_messages = [{"role": "user", "content": "你好"}]
        get_ai_response(test_messages)
        return True
    except Exception:
        return False
