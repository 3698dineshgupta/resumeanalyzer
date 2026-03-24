"""
MongoDB connection utility using PyMongo.
Replace MONGO_URI in .env to point to your Atlas cluster or local instance.
"""

from pymongo import MongoClient
from flask import current_app, g
import os

_client = None


def get_db():
    """Return the MongoDB database instance (cached per process)."""
    global _client
    if _client is None:
        uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        _client = MongoClient(uri)
    db_name = os.getenv("MONGO_DB_NAME", "resume_analyzer")
    return _client[db_name]


def init_db(app):
    """Called once at app startup to verify connection."""
    with app.app_context():
        try:
            db = get_db()
            db.command("ping")
            print("✅  MongoDB connected successfully")
        except Exception as e:
            print(f"⚠️  MongoDB connection failed: {e}")
            print("   App will start but database operations will fail.")
            print("   Set MONGO_URI in backend/.env to fix this.")
