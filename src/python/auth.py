import hashlib
import sqlite3
from functools import wraps
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request, session


auth_bp = Blueprint("auth", __name__)


def get_db_path():
    return Path(current_app.config["DATABASE"])


def get_db():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def md5_password(password):
    return hashlib.md5(password.encode("utf-8")).hexdigest()


def init_users_db(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_md5 TEXT NOT NULL,
            create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    cursor.execute("PRAGMA table_info(users)")
    columns = {row[1] for row in cursor.fetchall()}
    if "password_md5" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN password_md5 TEXT")

    conn.commit()
    conn.close()


def validate_username(username):
    if not username:
        return "用户名不能为空"
    if len(username) < 2 or len(username) > 20:
        return "用户名长度需要在 2 到 20 个字符之间"
    return None


def validate_password(password):
    if not password:
        return "密码不能为空"
    if len(password) < 6 or len(password) > 32:
        return "密码长度需要在 6 到 32 个字符之间"
    return None


def login_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        user_id = session.get("user_id")
        username = session.get("username")
        if not user_id or not username:
            return jsonify({"error": "请先登录后再发表评论"}), 401
        return view_func(user_id, username, *args, **kwargs)

    return wrapped


def get_user_columns(cursor):
    cursor.execute("PRAGMA table_info(users)")
    return {row["name"] for row in cursor.fetchall()}


@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    username_error = validate_username(username)
    if username_error:
        return jsonify({"error": username_error}), 400

    password_error = validate_password(password)
    if password_error:
        return jsonify({"error": password_error}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "用户名已存在，请换一个用户名"}), 409

    password_md5 = md5_password(password)
    columns = get_user_columns(cursor)
    if "password_hash" in columns:
        cursor.execute(
            "INSERT INTO users (username, password_md5, password_hash) VALUES (?, ?, ?)",
            (username, password_md5, password_md5),
        )
    else:
        cursor.execute(
            "INSERT INTO users (username, password_md5) VALUES (?, ?)",
            (username, password_md5),
        )
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    session["user_id"] = user_id
    session["username"] = username
    return jsonify({"msg": "注册成功", "user_id": user_id, "username": username})


@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    username_error = validate_username(username)
    if username_error:
        return jsonify({"error": username_error}), 400

    if not password:
        return jsonify({"error": "密码不能为空"}), 400

    conn = get_db()
    cursor = conn.cursor()
    columns = get_user_columns(cursor)
    password_column = "password_md5" if "password_md5" in columns else "password_hash"
    cursor.execute(
        f"SELECT id, username, {password_column} AS password_md5 FROM users WHERE username = ?",
        (username,),
    )
    user = cursor.fetchone()
    conn.close()

    if not user or user["password_md5"] != md5_password(password):
        return jsonify({"error": "用户名或密码错误"}), 401

    session["user_id"] = user["id"]
    session["username"] = user["username"]
    return jsonify({"msg": "登录成功", "user_id": user["id"], "username": user["username"]})


@auth_bp.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"msg": "已退出登录"})


@auth_bp.route("/api/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    username = session.get("username")
    return jsonify(
        {
            "logged_in": bool(user_id and username),
            "user_id": user_id,
            "username": username,
        }
    )
