"""
Resume routes: upload, fetch, export
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime

from utils.db import get_db
from services.resume_parser import parse_resume
from services.analysis import analyze_resume

resume_bp = Blueprint("resume", __name__)

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc"}


def _allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@resume_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename or not _allowed(file.filename):
        return jsonify({"error": "Only PDF, DOC, DOCX files are supported"}), 400

    file_bytes = file.read()
    print(f"DEBUG: Processing upload for {file.filename} ({len(file_bytes)} bytes)")
    try:
        parsed = parse_resume(file_bytes, file.filename)
        print("DEBUG: Parse successful")
    except Exception as e:
        print(f"ERROR: Resume parsing failed: {str(e)}")
        return jsonify({"error": f"Failed to parse resume: {str(e)}"}), 422

    try:
        analysis = analyze_resume(parsed)
        print("DEBUG: Analysis successful")
    except Exception as e:
        print(f"ERROR: Analysis failed: {str(e)}")
        return jsonify({"error": "Failed to analyze resume metadata"}), 500

    user_id = get_jwt_identity()
    db      = get_db()

    resume_doc = {
        "user_id":     user_id,
        "filename":    file.filename,
        "parsed":      parsed,
        "analysis":    analysis,
        "uploaded_at": datetime.utcnow(),
    }
    # Upsert: one resume per user (latest wins)
    db.resumes.update_one(
        {"user_id": user_id},
        {"$set": resume_doc},
        upsert=True
    )

    return jsonify({
        "message":  "Resume uploaded and parsed successfully",
        "parsed":   {k: v for k, v in parsed.items() if k != "raw_text"},
        "analysis": analysis,
    })


@resume_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_resume():
    user_id = get_jwt_identity()
    db      = get_db()
    resume  = db.resumes.find_one({"user_id": user_id})

    if not resume:
        return jsonify({"error": "No resume found. Please upload one."}), 404

    parsed   = resume.get("parsed", {})
    analysis = resume.get("analysis", {})

    return jsonify({
        "filename":    resume.get("filename"),
        "uploaded_at": resume.get("uploaded_at", "").isoformat() if resume.get("uploaded_at") else "",
        "parsed":      {k: v for k, v in parsed.items() if k != "raw_text"},
        "analysis":    analysis,
    })


@resume_bp.route("/export", methods=["GET"])
@jwt_required()
def export_resume():
    """Export parsed resume data as JSON download."""
    user_id = get_jwt_identity()
    db      = get_db()
    resume  = db.resumes.find_one({"user_id": user_id})
    if not resume:
        return jsonify({"error": "No resume found"}), 404

    parsed = {k: v for k, v in resume.get("parsed", {}).items() if k != "raw_text"}
    return jsonify(parsed), 200, {
        "Content-Disposition": "attachment; filename=resume_data.json"
    }
