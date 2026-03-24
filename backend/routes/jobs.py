"""
Jobs routes: recommended, nearby, remote, apply, applied, save
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from utils.db import get_db
from services.job_adapter import fetch_jobs
from services.matching import compute_match

jobs_bp = Blueprint("jobs", __name__)


def _get_resume(db, user_id: str) -> dict:
    doc = db.resumes.find_one({"user_id": user_id})
    return doc if doc else {}


# ── Recommended jobs (matched to resume) ──────────────────────────────────────

@jobs_bp.route("/recommended", methods=["GET"])
@jwt_required()
def recommended():
    user_id = get_jwt_identity()
    db      = get_db()
    resume  = _get_resume(db, user_id)

    filters = {
        "query":    request.args.get("query", ""),
        "category": request.args.get("category", ""),
    }
    jobs = fetch_jobs(filters)
    if resume:
        jobs = compute_match(resume, jobs)

    return jsonify(jobs[:20])


# ── Nearby jobs ───────────────────────────────────────────────────────────────

@jobs_bp.route("/nearby", methods=["GET"])
@jwt_required()
def nearby():
    user_id  = get_jwt_identity()
    db       = get_db()
    resume   = _get_resume(db, user_id)
    location = request.args.get("location", "")

    filters = {
        "location": location,
        "query":    request.args.get("query", ""),
    }
    jobs = fetch_jobs(filters)
    if resume:
        jobs = compute_match(resume, jobs)

    return jsonify(jobs[:20])


# ── Remote jobs ───────────────────────────────────────────────────────────────

@jobs_bp.route("/remote", methods=["GET"])
@jwt_required()
def remote():
    user_id = get_jwt_identity()
    db      = get_db()
    resume  = _get_resume(db, user_id)

    filters = {
        "job_type": "remote",
        "query":    request.args.get("query", ""),
    }
    jobs = fetch_jobs(filters)
    if resume:
        jobs = compute_match(resume, jobs)

    return jsonify(jobs[:20])


# ── All jobs with filters ─────────────────────────────────────────────────────

@jobs_bp.route("/all", methods=["GET"])
@jwt_required()
def all_jobs():
    user_id = get_jwt_identity()
    db      = get_db()
    resume  = _get_resume(db, user_id)

    filters = {
        "query":    request.args.get("query", ""),
        "location": request.args.get("location", ""),
        "job_type": request.args.get("job_type", ""),
        "category": request.args.get("category", ""),
    }
    jobs = fetch_jobs(filters)
    if resume:
        jobs = compute_match(resume, jobs)

    return jsonify(jobs[:50])


# ── Apply to a job ────────────────────────────────────────────────────────────

@jobs_bp.route("/apply", methods=["POST"])
@jwt_required()
def apply():
    user_id = get_jwt_identity()
    data    = request.get_json()
    job_id  = data.get("job_id", "")
    job     = data.get("job", {})

    if not job_id:
        return jsonify({"error": "job_id required"}), 400

    db = get_db()
    # Avoid duplicate entries
    existing = db.users.find_one({
        "_id": __import__("bson").ObjectId(user_id),
        "applied_jobs.job_id": job_id
    })
    if not existing:
        db.users.update_one(
            {"_id": __import__("bson").ObjectId(user_id)},
            {"$push": {"applied_jobs": {
                "job_id":     job_id,
                "title":      job.get("title", ""),
                "company":    job.get("company", ""),
                "location":   job.get("location", ""),
                "apply_url":  job.get("apply_url", ""),
                "applied_at": datetime.utcnow().isoformat(),
            }}}
        )

    return jsonify({"message": "Job application recorded"})


# ── Get applied jobs ──────────────────────────────────────────────────────────

@jobs_bp.route("/applied", methods=["GET"])
@jwt_required()
def applied():
    user_id = get_jwt_identity()
    db      = get_db()
    user    = db.users.find_one({"_id": __import__("bson").ObjectId(user_id)})
    if not user:
        return jsonify([])
    
    # DEDUPLICATION: Ensure ghost/duplicate data doesn't inflate the count
    raw_applied = user.get("applied_jobs", [])
    seen_ids = set()
    cleaned_applied = []
    for item in raw_applied:
        jid = item.get("job_id")
        if jid and jid not in seen_ids:
            seen_ids.add(jid)
            cleaned_applied.append(item)
            
    return jsonify(cleaned_applied)


# ── Save / unsave a job ───────────────────────────────────────────────────────

@jobs_bp.route("/save", methods=["POST"])
@jwt_required()
def save_job():
    user_id = get_jwt_identity()
    data    = request.get_json()
    job_id  = data.get("job_id", "")
    job     = data.get("job", {})

    db = get_db()
    user = db.users.find_one({"_id": __import__("bson").ObjectId(user_id)})
    saved = user.get("saved_jobs", []) if user else []
    ids   = [s.get("job_id") for s in saved]

    if job_id in ids:
        # Unsave
        db.users.update_one(
            {"_id": __import__("bson").ObjectId(user_id)},
            {"$pull": {"saved_jobs": {"job_id": job_id}}}
        )
        return jsonify({"message": "Job removed from saved", "saved": False})
    else:
        # Save
        db.users.update_one(
            {"_id": __import__("bson").ObjectId(user_id)},
            {"$push": {"saved_jobs": {
                "job_id":   job_id,
                "title":    job.get("title", ""),
                "company":  job.get("company", ""),
                "location": job.get("location", ""),
                "apply_url":job.get("apply_url", ""),
            }}}
        )
        return jsonify({"message": "Job saved", "saved": True})
