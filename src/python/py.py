import os
import sqlite3
import subprocess
import sys
import tempfile
from pathlib import Path


def install_package(package):
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    except Exception:
        pass


try:
    from flask import Flask, jsonify, request
    from flask_cors import CORS
except ImportError:
    print("正在自动安装依赖...")
    install_package("flask")
    install_package("flask-cors")
    from flask import Flask, jsonify, request
    from flask_cors import CORS

from auth import auth_bp, init_users_db, login_required


TAGS = [1, 2, 3, 4]

BASE_DIR = Path(__file__).resolve().parents[2]


def sqlite_path_is_usable(path):
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(path)
        conn.execute("CREATE TABLE IF NOT EXISTS __db_check (id INTEGER)")
        conn.commit()
        conn.close()
        return True
    except (OSError, sqlite3.Error):
        return False


def choose_database_path():
    env_path = os.getenv("PINGYAO_DB")
    candidates = []
    if env_path:
        candidates.append(Path(env_path))
    candidates.append(BASE_DIR / "comments.db")

    app_data = os.getenv("LOCALAPPDATA") or tempfile.gettempdir()
    candidates.append(Path(app_data) / "pingyao-main" / "comments.db")
    candidates.append(Path(tempfile.gettempdir()) / "pingyao-main-comments.db")

    for path in candidates:
        if sqlite_path_is_usable(path):
            return path

    raise RuntimeError("没有找到可用的 SQLite 数据库位置")


DB = choose_database_path()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "pingyao-login-dev-secret")
app.config["DATABASE"] = str(DB)
CORS(app, supports_credentials=True)
app.register_blueprint(auth_bp)


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    init_users_db(DB)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT NOT NULL,
            content TEXT NOT NULL,
            tag INTEGER NOT NULL,
            create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute("PRAGMA table_info(comments)")
    columns = {row["name"] for row in cursor.fetchall()}
    if "user_id" not in columns:
        cursor.execute("ALTER TABLE comments ADD COLUMN user_id INTEGER")

    conn.commit()
    conn.close()


def generate_dummy_comments():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) AS count FROM comments")
    count = cursor.fetchone()["count"]
    if count > 0:
        conn.close()
        return

    users = ["小明", "小李", "小张", "小王", "小陈", "小赵", "小刘", "小孙", "小周", "小吴"]
    contents = [
        "平遥古城的历史氛围很浓，走在街上像穿越了一样。",
        "平遥牛肉确实值得试试，味道很扎实。",
        "非遗手工艺展示很细致，能看出匠人的功底。",
        "旅游路线安排得很顺，第一次来的人也不容易迷路。",
        "古城夜景很漂亮，灯光和城墙很有味道。",
        "这边的醋和点心适合买回去当伴手礼。",
        "漆器工艺很精美，适合慢慢看。",
        "导览内容很专业，对晋商文化讲得比较透。",
        "游客不少，但整体秩序还可以。",
        "整体体验不错，适合周末来逛一逛。",
    ]
    tags = [1, 2, 3, 4]

    for i in range(50):
        cursor.execute(
            "INSERT INTO comments (username, content, tag) VALUES (?, ?, ?)",
            (
                users[i % len(users)],
                f"{contents[i % len(contents)]} 测试评论 {i + 1}",
                tags[i % len(tags)],
            ),
        )

    conn.commit()
    conn.close()


@app.route("/api/comment", methods=["POST"])
@login_required
def add_comment(user_id, username):
    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    tag = data.get("tag")

    if not content:
        return jsonify({"error": "评论内容不能为空"}), 400
    if len(content) > 200:
        return jsonify({"error": "评论内容不能超过 200 个字符"}), 400
    if tag not in TAGS:
        return jsonify({"error": "请选择正确的评论分类"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO comments (user_id, username, content, tag) VALUES (?, ?, ?, ?)",
        (user_id, username, content, tag),
    )
    conn.commit()
    conn.close()

    return jsonify({"msg": "发布成功"})


@app.route("/api/comments", methods=["GET"])
def get_comments():
    page = max(int(request.args.get("page", 1)), 1)
    tag = request.args.get("tag")
    limit = 5
    offset = (page - 1) * limit

    conn = get_db()
    cursor = conn.cursor()

    if tag:
        cursor.execute(
            "SELECT * FROM comments WHERE tag = ? ORDER BY create_time DESC LIMIT ? OFFSET ?",
            (tag, limit, offset),
        )
    else:
        cursor.execute(
            "SELECT * FROM comments ORDER BY create_time DESC LIMIT ? OFFSET ?",
            (limit, offset),
        )

    rows = cursor.fetchall()
    conn.close()

    return jsonify(
        [
            {
                "id": row["id"],
                "user_id": row["user_id"] if "user_id" in row.keys() else None,
                "username": row["username"],
                "content": row["content"],
                "tag": row["tag"],
                "time": row["create_time"],
            }
            for row in rows
        ]
    )


@app.route("/api/my_comments", methods=["GET"])
@login_required
def my_comments(user_id, username):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT * FROM comments
        WHERE user_id = ? OR (user_id IS NULL AND username = ?)
        ORDER BY create_time DESC
        """,
        (user_id, username),
    )
    rows = cursor.fetchall()
    conn.close()

    return jsonify(
        [
            {
                "id": row["id"],
                "content": row["content"],
                "tag": row["tag"],
                "time": row["create_time"],
            }
            for row in rows
        ]
    )


init_db()
generate_dummy_comments()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
