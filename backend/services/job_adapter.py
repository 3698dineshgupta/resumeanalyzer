"""
Job adapter service.

Architecture:
  ┌─────────────────────────┐
  │   fetch_jobs(filters)   │  ← public interface used by routes
  └────────────┬────────────┘
               │
       ┌───────▼────────┐
       │  _get_adapter  │  reads JOB_PROVIDER env var
       └───────┬────────┘
    ┌──────────┼──────────┐
    ▼          ▼          ▼
  mock      adzuna      jooble   ← swap with real impl later
  (default)

To plug in a real API:
  1. Set JOB_PROVIDER=adzuna in backend/.env
  2. Set ADZUNA_APP_ID and ADZUNA_API_KEY
  3. Implement _fetch_adzuna() below (stub provided)
"""

import json
import os
import math
from pathlib import Path

PROVIDER = os.getenv("JOB_PROVIDER", "mock")


# ── Public API ─────────────────────────────────────────────────────────────────

def fetch_jobs(filters: dict = None) -> list[dict]:
    """
    filters keys:
      location   (str)  – city name, 'remote', or empty for all
      job_type   (str)  – 'remote' | 'onsite' | 'hybrid' | ''
      query      (str)  – free-text search
      category   (str)  – e.g. 'AI/ML', 'Frontend', …
      lat / lng  (float)– for distance-based filtering (mock ignores these)
    """
    filters = filters or {}
    adapter = _get_adapter()
    jobs    = adapter(filters)
    return jobs


# ── Adapter selector ───────────────────────────────────────────────────────────

def _get_adapter():
    if PROVIDER == "adzuna":
        return _fetch_adzuna
    if PROVIDER == "jooble":
        return _fetch_jooble
    return _fetch_mock


# ── Mock adapter (sample realistic data) ──────────────────────────────────────

def _fetch_mock(filters: dict) -> list[dict]:
    data_file = Path(__file__).parent.parent / "data" / "sample_jobs.json"
    with open(data_file, "r", encoding="utf-8") as f:
        jobs = json.load(f)

    # Apply simple in-memory filtering
    location  = (filters.get("location") or "").lower()
    job_type  = (filters.get("job_type") or "").lower()
    query     = (filters.get("query") or "").lower()
    category  = (filters.get("category") or "").lower()

    results = []
    for job in jobs:
        # location filter
        if location and location not in ("all", "anywhere"):
            job_loc = job.get("location", "").lower()
            if location == "remote":
                if job.get("work_mode", "").lower() != "remote":
                    continue
            elif location not in job_loc and job.get("work_mode", "").lower() != "remote":
                continue

        # job_type filter
        if job_type and job_type != "all":
            if job.get("work_mode", "").lower() != job_type:
                continue

        # free text search
        if query:
            haystack = f"{job.get('title','')} {job.get('company','')} {job.get('description','')}".lower()
            if query not in haystack:
                continue

        # category filter
        if category and category not in job.get("category", "").lower():
            continue

        results.append(job)

    return results


# ── Adzuna adapter stub ───────────────────────────────────────────────────────
# 🔑 To enable: set JOB_PROVIDER=adzuna, ADZUNA_APP_ID, ADZUNA_API_KEY in .env

def _fetch_adzuna(filters: dict) -> list[dict]:
    import requests
    app_id  = os.getenv("ADZUNA_APP_ID", "")
    api_key = os.getenv("ADZUNA_API_KEY", "")
    if not app_id or not api_key:
        raise RuntimeError("Set ADZUNA_APP_ID and ADZUNA_API_KEY in .env")

    params = {
        "app_id":   app_id,
        "app_key":  api_key,
        "results_per_page": 20,
        "what":     filters.get("query", "developer"),
        "where":    filters.get("location", "India"),
        "content-type": "application/json",
    }
    resp = requests.get(
        "https://api.adzuna.com/v1/api/jobs/in/search/1",
        params=params, timeout=10
    )
    resp.raise_for_status()
    raw = resp.json().get("results", [])

    # Normalize to our schema
    return [_normalize_adzuna(j) for j in raw]


def _normalize_adzuna(j: dict) -> dict:
    return {
        "id":              j.get("id", ""),
        "title":           j.get("title", ""),
        "company":         j.get("company", {}).get("display_name", ""),
        "location":        j.get("location", {}).get("display_name", ""),
        "work_mode":       "remote" if "remote" in j.get("title", "").lower() else "onsite",
        "salary":          f"${j['salary_min']:.0f} – ${j['salary_max']:.0f}" if j.get("salary_min") else "",
        "required_skills": [],
        "description":     j.get("description", ""),
        "apply_url":       j.get("redirect_url", ""),
        "category":        j.get("category", {}).get("label", ""),
        "posted_date":     j.get("created", ""),
    }


# ── Jooble adapter stub ───────────────────────────────────────────────────────
# 🔑 To enable: set JOB_PROVIDER=jooble, JOOBLE_API_KEY in .env

def _fetch_jooble(filters: dict) -> list[dict]:
    import requests
    api_key = os.getenv("JOOBLE_API_KEY", "")
    if not api_key:
        raise RuntimeError("Set JOOBLE_API_KEY in .env")

    payload = {
        "keywords": filters.get("query", "developer"),
        "location": filters.get("location", "India"),
    }
    resp = requests.post(
        f"https://jooble.org/api/{api_key}",
        json=payload, timeout=10
    )
    resp.raise_for_status()
    raw = resp.json().get("jobs", [])
    return [_normalize_jooble(j) for j in raw]


def _normalize_jooble(j: dict) -> dict:
    return {
        "id":              j.get("id", ""),
        "title":           j.get("title", ""),
        "company":         j.get("company", ""),
        "location":        j.get("location", ""),
        "work_mode":       "remote" if "remote" in j.get("type", "").lower() else "onsite",
        "salary":          j.get("salary", ""),
        "required_skills": [],
        "description":     j.get("snippet", ""),
        "apply_url":       j.get("link", ""),
        "category":        "",
        "posted_date":     j.get("updated", ""),
    }
