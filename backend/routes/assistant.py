"""
Assistant routes: natural language queries
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from utils.db import get_db
from services.assistant import get_answer
from services.job_adapter import fetch_jobs
from services.matching import compute_match

assistant_bp = Blueprint("assistant", __name__)


@assistant_bp.route("/query", methods=["POST"])
@jwt_required()
def query():
    data  = request.get_json()
    q     = data.get("query", "").strip()
    if not q:
        return jsonify({"error": "query is required"}), 400

    user_id = get_jwt_identity()
    db      = get_db()

    resume_doc = db.resumes.find_one({"user_id": user_id})
    parsed     = resume_doc.get("parsed", {}) if resume_doc else {}

    # Merge analysis fields into parsed for assistant context
    if resume_doc and resume_doc.get("analysis"):
        parsed.update(resume_doc["analysis"])

    # Fetch + match jobs for context
    jobs = fetch_jobs()
    if parsed:
        jobs = compute_match(parsed, jobs)

    answer = get_answer(q, parsed, jobs)
    return jsonify({"answer": answer})
