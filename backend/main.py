"""
平遥晋商 AI 对话后端
基于 FastAPI + 硅基流动/OpenAI API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# 创建 FastAPI 应用
app = FastAPI(
    title="平遥晋商 AI 对话 API",
    description="""
## 平遥晋商文化智能问答系统

基于晋商历史文化的 AI 对话服务，专门回答关于：
- 平遥古城历史
- 晋商票号发展
- 雷履泰、毛鸿翙等商界人物
- 票号经营制度
- 商号文化

## 接口说明
- POST /api/chat - 发送消息，获取 AI 回复
- POST /api/clear - 清除对话历史
- GET /api/history/{session_id} - 获取对话历史
    """,
    version="1.0.0"
)

# 配置 CORS（跨域访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 导入路由（放在这里避免循环导入）
from routers.chat import router as chat_router
app.include_router(chat_router)


@app.get("/", tags=["首页"])
async def root():
    """首页"""
    return {
        "name": "平遥晋商 AI 对话系统",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "chat": "/api/chat",
            "health": "/health"
        }
    }


@app.get("/health", tags=["健康检查"])
async def health_check():
    """健康检查接口"""
    from services.openai_service import check_api_health
    api_status = "unknown"
    try:
        api_status = "healthy" if check_api_health() else "unavailable"
    except Exception:
        api_status = "error"

    return {
        "status": "ok",
        "api_status": api_status
    }


# 启动提示
if __name__ == "__main__":
    import uvicorn
    logger.info("启动平遥晋商 AI 对话服务...")
    logger.info("访问 http://localhost:8000/docs 查看 API 文档")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
