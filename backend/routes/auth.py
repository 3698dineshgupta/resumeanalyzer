"""
Authentication routes: /api/auth/register  /api/auth/login
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from utils.db import get_db
from utils.auth_helpers import hash_password, check_password
from datetime import datetime

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name  = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400

    db = get_db()
    if db.users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    user = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "created_at": datetime.utcnow(),
        "applied_jobs": [],
        "saved_jobs": [],
    }
    result = db.users.insert_one(user)
    token  = create_access_token(identity=str(result.inserted_id))

    return jsonify({
        "token": token,
        "user": {"id": str(result.inserted_id), "name": name, "email": email}
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    db   = get_db()
    user = db.users.find_one({"email": email})

    if not user or not check_password(password, user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({
        "token": token,
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}
    })
