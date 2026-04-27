# 平遥晋商 AI 对话后端

## 项目结构

```
backend/
├── main.py              # 主入口
├── config.py             # 配置（API密钥等）
├── requirements.txt      # 依赖
├── routers/
│   └── chat.py          # 对话接口
├── services/
│   └── openai_service.py # AI 服务
└── prompts/
    └── system_prompt.py  # 系统提示词
```

---

## 1. 安装依赖

```bash
pip install fastapi uvicorn openai httpx python-dotenv
```

---

## 2. 配置文件 config.py

```python
import os
from dotenv import load_dotenv

load_dotenv()

# AI API 配置（硅基流动 - 免费额度）
API_BASE = "https://api.siliconflow.cn/v1"
API_KEY = os.getenv("SILICON_API_KEY")  # 你的 API Key
MODEL = "Qwen/Qwen2.5-7B-Instruct"

# 或者用 OpenAI
# API_BASE = "https://api.openai.com/v1"
# API_KEY = os.getenv("OPENAI_API_KEY")
# MODEL = "gpt-3.5-turbo"
```

---

## 3. 系统提示词 prompts/system_prompt.py

```python
SYSTEM_PROMPT = """你是平遥晋商文化专家，对平遥古城的晋商历史有深入研究。

## 你熟悉的领域

### 票号历史
- 日升昌：中国第一家票号，1823年由雷履泰创办
- 蔚泰厚：由毛鸿翙创办，与日升昌形成竞争
- 票号发展：经历了票号、账庄、银号等演变

### 核心人物
- 雷履泰：日升昌创始人，中国票号业开山人物
- 毛鸿翙：原日升昌二掌柜，后创立蔚泰厚
- 李大全：西裕成颜料庄财东，出资创办日升昌

### 经营制度
- 两权分离：东家出钱，掌柜经营
- 密押制度：防伪造、防泄露
- 镖局押运：运送银两

### 商号文化
- 以义取利，诚信为本
- 吃苦耐劳，勤俭持家
- 同乡互助，伙计推荐

请用专业且易懂的方式回答用户问题。如果问题与晋商无关，请礼貌引导回到主题。"""
```

---

## 4. AI 服务 services/openai_service.py

```python
from openai import OpenAI
from config import API_BASE, API_KEY, MODEL

client = OpenAI(
    api_key=API_KEY,
    base_url=API_BASE
)

def get_ai_response(messages: list) -> str:
    """调用 AI 获取回复"""
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=500
    )
    return response.choices[0].message.content
```

---

## 5. 对话接口 routers/chat.py

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.openai_service import get_ai_response
from prompts.system_prompt import SYSTEM_PROMPT

router = APIRouter()

# 存储对话历史（简单版，生产环境用 Redis）
chat_history = {}

class ChatRequest(BaseModel):
    session_id: str
    user_message: str

class ChatResponse(BaseModel):
    ai_message: str
    session_id: str

@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # 获取或创建会话历史
        if request.session_id not in chat_history:
            chat_history[request.session_id] = [
                {"role": "system", "content": SYSTEM_PROMPT}
            ]
        
        # 添加用户消息
        chat_history[request.session_id].append({
            "role": "user", 
            "content": request.user_message
        })
        
        # 调用 AI
        ai_response = get_ai_response(chat_history[request.session_id])
        
        # 保存 AI 回复
        chat_history[request.session_id].append({
            "role": "assistant",
            "content": ai_response
        })
        
        # 限制历史长度（节省 Token）
        if len(chat_history[request.session_id]) > 20:
            chat_history[request.session_id] = [
                chat_history[request.session_id][0],  # 保留 system prompt
                *chat_history[request.session_id][-19:]
            ]
        
        return ChatResponse(
            ai_message=ai_response,
            session_id=request.session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## 6. 主入口 main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat

app = FastAPI(
    title="平遥晋商 AI 对话 API",
    description="基于晋商文化的智能问答系统"
)

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境改为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat.router)

@app.get("/")
async def root():
    return {"message": "平遥晋商 AI 对话系统", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

## 7. 启动服务

```bash
cd backend
python main.py
# 服务运行在 http://localhost:8000
```

---

## 8. 测试 API

```bash
# 测试对话接口
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test1", "user_message": "日升昌是什么时候创建的？"}'
```

---

## 前端调用示例

```javascript
// 在 06_character_map.html 中添加

async function sendToAI(message) {
  const response = await fetch("http://localhost:8000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: "merchant_graph",
      user_message: message
    })
  });
  const data = await response.json();
  return data.ai_message;
}
```

---

需要我帮你创建完整的项目文件吗？
