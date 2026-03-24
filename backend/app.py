"""
AI-Powered Resume Analyzer - Flask Backend
Main application entry point
"""

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

from routes.auth import auth_bp
from routes.resume import resume_bp
from routes.jobs import jobs_bp
from routes.analysis import analysis_bp
from routes.assistant import assistant_bp
from utils.db import init_db

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)

    # ── Configuration ──────────────────────────────────────────────────────────
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-change-me")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
    app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024
    
    # ── Extensions ─────────────────────────────────────────────────────────────
    CORS(app, resources={r"/api/*": {
        "origins": [
            os.getenv("FRONTEND_URL", "http://localhost:5173"),
            "http://127.0.0.1:5173"
        ]
    }})
    JWTManager(app)

    # ── Database ───────────────────────────────────────────────────────────────
    init_db(app)

    # ── Blueprints ─────────────────────────────────────────────────────────────
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
    app.register_blueprint(analysis_bp, url_prefix="/api/analysis")
    app.register_blueprint(assistant_bp, url_prefix="/api/assistant")

    @app.errorhandler(Exception)
    def handle_exception(e):
        print(f"🔥 GLOBAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": "Internal server error"}, 500

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "Resume Analyzer API is running"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))