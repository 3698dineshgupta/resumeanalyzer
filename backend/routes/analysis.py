"""
Analysis routes: ATS score, skill gap
"""

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from utils.db import get_db
from services.analysis import analyze_resume

analysis_bp = Blueprint("analysis", __name__)


@analysis_bp.route("/score", methods=["GET"])
@jwt_required()
def score():
    user_id = get_jwt_identity()
    db      = get_db()
    resume  = db.resumes.find_one({"user_id": user_id})

    if not resume:
        return jsonify({"error": "No resume found"}), 404

    # Re-run analysis (or return cached)
    analysis = resume.get("analysis") or analyze_resume(resume.get("parsed", {}))
    return jsonify(analysis)
