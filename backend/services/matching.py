"""
Job matching service - Production Grade Pipeline.

Stages:
B — Job normalization & attribute extraction
C — Candidate-job scoring (multi-signal weighted model)
D — Ranking, Penalties, and Explainability
"""
import re

# ── Configuration & Constants ──────────────────────────────────────────────────

SYNONYMS = {
    "js": "javascript", "node": "node.js", "node js": "node.js", "nodejs": "node.js",
    "reactjs": "react", "react.js": "react", "vuejs": "vue", "vue.js": "vue",
    "c#": "c sharp", "ml": "machine learning", "ai": "artificial intelligence",
    "frontend": "front-end", "backend": "back-end", "fullstack": "full-stack",
    "py": "python", "aws cloud": "aws", "gcp": "google cloud"
}

ROLE_FAMILIES = {
    "Frontend": ["html", "css", "javascript", "react", "vue", "angular", "typescript", "frontend", "ui", "ux"],
    "Backend":  ["python", "node.js", "java", "sql", "api", "flask", "django", "backend", "express", "postgresql"],
    "AI/ML":    ["python", "machine learning", "tensorflow", "pytorch", "nlp", "scikit-learn", "data science"],
    "Data":      ["sql", "pandas", "tableau", "power bi", "data analyst", "excel", "numpy", "r"],
    "DevOps":    ["aws", "docker", "kubernetes", "linux", "ci/cd", "terraform", "jenkins", "azure", "gcp"],
    "Mobile":    ["flutter", "react native", "ios", "android", "swift", "kotlin"]
}

SENIORITY_RANKS = {
    "Student/Intern": 0,
    "Junior":         1,
    "Mid-Level":      2,
    "Senior":         3
}

# ── Stage B: Job Normalization ────────────────────────────────────────────────

def normalize_skill(skill: str) -> str:
    s = str(skill).lower().strip()
    return SYNONYMS.get(s, s)

def extract_job_profile(job: dict) -> dict:
    """Normalizes job data into structured signals (Stage B)."""
    title = job.get("title", "").lower()
    desc  = job.get("description", "").lower()
    cat   = job.get("category", "").lower()
    pool  = f"{title} {cat} {desc}"

    # Extract Skills
    raw_skills = job.get("required_skills") or []
    # If no explicit skills, infer from pool
    if not raw_skills:
        for domain, kw_list in ROLE_FAMILIES.items():
            for kw in kw_list:
                if kw in pool: raw_skills.append(kw)
    
    skills = {normalize_skill(s) for s in raw_skills}

    # Infer Domain
    domain = "Software Development"
    max_hits = 0
    for dom, kws in ROLE_FAMILIES.items():
        hits = sum(1 for k in kws if k in pool)
        if hits > max_hits:
            max_hits = hits
            domain = dom
            
    # Infer Seniority Hint
    seniority = "Junior" # Default
    if any(k in pool for k in ["student", "intern", "trainee", "entry level", "fresher"]):
        seniority = "Student/Intern"
    elif any(k in pool for k in ["senior", "lead", "architect", "staff", "principal", "director", "head of"]):
        seniority = "Senior"
    elif any(k in pool for k in ["mid", "intermediate", "experienced"]):
        seniority = "Mid-Level"

    return {
        "skills":    skills,
        "domain":    domain,
        "seniority": seniority,
        "is_remote": job.get("job_type") == "remote" or "remote" in pool
    }

# ── Stage C: Candidate-Job Scoring ───────────────────────────────────────────

def calculate_multi_signal_score(candidate_profile: dict, job_profile: dict, job_raw: dict) -> tuple:
    """Computes weighted multi-signal relevance score (Stage C)."""
    res_skills = {normalize_skill(s) for s in candidate_profile.get("parsed", {}).get("skills", [])}
    # Inferred profile is stored inside analysis field
    inf_profile = candidate_profile.get("analysis", {}).get("inferred_profile", {})
    
    signals = {}
    reasons = []

    # 1. Skill Overlap (35%)
    skill_overlap = 0.0
    if job_profile["skills"]:
        matched = res_skills.intersection(job_profile["skills"])
        skill_overlap = len(matched) / len(job_profile["skills"])
    signals["skills"] = skill_overlap
    if skill_overlap > 0.6: reasons.append("Strong technical skill alignment")

    # 2. Role/Title Relevance (20%)
    title_words = set(re.findall(r'\w+', job_raw.get("title", "").lower()))
    title_words = {w for w in title_words if len(w) > 3}
    title_match = 0.0
    if title_words:
        resume_text = (candidate_profile.get("parsed", {}).get("summary", "") + " " + " ".join(candidate_profile.get("parsed", {}).get("experience", []))).lower()
        found = sum(1 for w in title_words if w in resume_text)
        title_match = found / len(title_words)
    signals["title"] = title_match
    if title_match > 0.5: reasons.append(f"Title matches your background in {job_profile['domain']}")

    # 3. Project Alignment (15%)
    proj_text = " ".join(candidate_profile.get("parsed", {}).get("projects", [])).lower()
    proj_match = sum(1 for s in job_profile["skills"] if s in proj_text)
    proj_score = min(1.0, proj_match / max(len(job_profile["skills"]), 1))
    signals["projects"] = proj_score
    if proj_score > 0.3: reasons.append("Your personal projects demonstrate relevant expertise")

    # 4. Seniority Fit (10%)
    cand_rank = SENIORITY_RANKS.get(inf_profile.get("seniority"), 1)
    job_rank  = SENIORITY_RANKS.get(job_profile["seniority"], 1)
    seniority_score = 1.0 - (abs(cand_rank - job_rank) * 0.3) # Penalty for mismatch
    signals["seniority"] = max(0, seniority_score)
    
    # Critical Penalty: Student matching Senior/Director
    if cand_rank == 0 and job_rank >= 3:
        signals["seniority"] = 0.1 # Severe demotion
        reasons.append("Warning: This role requires significantly more experience")
    elif seniority_score > 0.8:
         reasons.append(f"Ideal match for your {inf_profile.get('seniority')} seniority level")

    # 5. Domain Relevance (10%)
    domain_match = 1.0 if job_profile["domain"] in inf_profile.get("domains", []) else 0.5
    signals["domain"] = domain_match
    if domain_match > 0.9: reasons.append(f"Aligned with your interest in {job_profile['domain']}")

    # 6. Foundation & Education (10%)
    edu_score = 1.0 if candidate_profile.get("parsed", {}).get("education") else 0.5
    signals["education"] = edu_score

    # Final Weighted Computation
    total = (0.35 * signals["skills"]) + \
            (0.20 * signals["title"]) + \
            (0.15 * signals["projects"]) + \
            (0.10 * signals["seniority"]) + \
            (0.10 * signals["domain"]) + \
            (0.10 * signals["education"])
            
    # Apply Floor for relevance
    if total > 0.01 and total < 0.2:
        total = 0.15 + (total * 0.2)
        
    final_score = max(0, min(round(total * 100), 100))
    
    # Stage D: Ranking & Labeling
    if final_score >= 80:    label = "Strong"
    elif final_score >= 60:  label = "Good"
    elif final_score >= 40:  label = "Moderate"
    elif final_score >= 20:  label = "Low"
    else:                    label = "Very Low"

    return final_score, label, reasons[:3]

def compute_match(resume_data: dict, jobs: list[dict]) -> list[dict]:
    """Production pipeline entry point."""
    result = []
    
    for job in jobs:
        # Stage B: Normalize Job
        job_profile = extract_job_profile(job)
        
        # Stage C: Score
        score, label, reasons = calculate_multi_signal_score(resume_data, job_profile, job)
        
        # Build explainable result
        res_skills = {normalize_skill(s) for s in resume_data.get("parsed", {}).get("skills", [])}
        matched = sorted(list(res_skills & job_profile["skills"]))
        missing = sorted(list(job_profile["skills"] - res_skills))

        result.append({
            **job,
            "match_score":      score,
            "match_label":      label,
            "matched_skills":   matched,
            "missing_skills":   missing,
            "relevance_reasons": reasons if reasons else ["General relevance match"]
        })

    # Stage D: Rank and Rerank
    result.sort(key=lambda x: (x.get("match_score", 0), x.get("match_label") == "Strong"), reverse=True)
    return result
