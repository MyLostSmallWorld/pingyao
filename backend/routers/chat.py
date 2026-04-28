"""
对话接口路由
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from services.openai_service import get_ai_response, APIError
from prompts.system_prompt import SYSTEM_PROMPT
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["对话"])

# 存储对话历史（简单版）
# 生产环境建议使用 Redis 或数据库
chat_history: dict[str, list] = {}


class ChatRequest(BaseModel):
    """对话请求"""
    session_id: str = Field(..., description="会话 ID，用于标识不同用户/对话")
    user_message: str = Field(..., min_length=1, max_length=500, description="用户消息")

    class Config:
        schema_extra = {
            "example": {
                "session_id": "user_123",
                "user_message": "日升昌是什么时候创建的？"
            }
        }


class ChatResponse(BaseModel):
    """对话响应"""
    ai_message: str = Field(..., description="AI 回复")
    session_id: str = Field(..., description="会话 ID")

    class Config:
        schema_extra = {
            "example": {
                "ai_message": "日升昌票号创建于1823年...",
                "session_id": "user_123"
            }
        }


class ClearHistoryRequest(BaseModel):
    """清除历史请求"""
    session_id: str = Field(..., description="要清除的会话 ID")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    发送消息给 AI，获取回复

    - **session_id**: 会话 ID，相同 ID 会共享对话历史
    - **user_message**: 用户发送的消息
    """
    try:
        # 获取或创建会话历史
        if request.session_id not in chat_history:
            chat_history[request.session_id] = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ]
            logger.info(f"创建新会话: {request.session_id}")

        # 添加用户消息
        chat_history[request.session_id].append({
            "role": "user",
            "content": request.user_message
        })

        logger.info(f"会话 {request.session_id} 发送消息: {request.user_message[:50]}...")

        # 调用 AI
        ai_response = get_ai_response(chat_history[request.session_id])

        # 保存 AI 回复
        chat_history[request.session_id].append({
            "role": "assistant",
            "content": ai_response
        })

        # 限制历史长度（节省 Token）
        max_length = 20
        if len(chat_history[request.session_id]) > max_length:
            # 保留 system prompt 和最近的对话
            chat_history[request.session_id] = [
                chat_history[request.session_id][0],  # system prompt
                *chat_history[request.session_id][-(max_length - 1):]
            ]

        return ChatResponse(
            ai_message=ai_response,
            session_id=request.session_id
        )

    except APIError as e:
        logger.error(f"API 错误: {e}")
        raise HTTPException(status_code=500, detail=f"AI 服务调用失败: {str(e)}")
    except Exception as e:
        logger.error(f"未知错误: {e}")
        raise HTTPException(status_code=500, detail=f"服务器错误: {str(e)}")


@router.post("/clear")
async def clear_history(request: ClearHistoryRequest):
    """清除指定会话的历史记录"""
    if request.session_id in chat_history:
        del chat_history[request.session_id]
        logger.info(f"清除会话历史: {request.session_id}")
        return {"message": f"会话 {request.session_id} 已清除", "success": True}
    return {"message": "会话不存在", "success": False}


@router.get("/history/{session_id}")
async def get_history(session_id: str):
    """获取指定会话的历史记录"""
    if session_id in chat_history:
        return {
            "session_id": session_id,
            "messages": chat_history[session_id]
        }
    return {"message": "会话不存在", "session_id": session_id}
