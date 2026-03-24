"""
Resume analysis service.

Produces an ATS-style score out of 100 based on weighted criteria:
- Contact info: 10
- Sections completeness: 20
- Skills strength: 25
- Experience: 15
- Projects: 15
- Education: 10
- Certifications/extras: 5

Includes penalties for:
- Critical missing skills
- Low experience/projects
- Noisy data
"""

# Critical skills that impact the score heavily if missing
CRITICAL_SKILLS = [
    "python", "javascript", "sql", "git", "machine learning", "react",
    "docker", "aws", "communication", "problem solving",
]

SECTION_WEIGHTS = {
    "name":       5,
    "email":      5,
    "phone":      5,
    "education":  10,
    "experience": 15,
    "projects":   15,
    "skills":     25,
}

def analyze_resume(parsed: dict) -> dict:
    score = 0
    strengths = []
    deductions = []
    section_scores = {}
    
    # 1. Contact & Sections (Weight: 30Total - using internal weights)
    # Name, Email, Phone: 15 pts total
    contact_pts = 0
    if parsed.get("name") and parsed.get("name") != "Unknown": contact_pts += 5
    if parsed.get("email"): contact_pts += 5
    if parsed.get("phone"): contact_pts += 5
    score += contact_pts
    section_scores["contact_info"] = contact_pts
    if contact_pts < 15: deductions.append(f"Incomplete contact information (-{15-contact_pts} pts)")
    
    # Sections (Education, Experience, Projects, Skills: 65 pts total)
    for section in ["education", "experience", "projects", "skills"]:
        weight = SECTION_WEIGHTS[section]
        val = parsed.get(section)
        if val and len(val) > 0:
            # Grant full section points if present
            score += weight
            section_scores[section] = weight
            strengths.append(f"Valid {section} section detected")
        else:
            section_scores[section] = 0
            deductions.append(f"Missing or empty {section} section (-{weight} pts)")

    # 2. Skills Strength (Deep Dive into the 25 pts already added + Bonus/Penalty)
    # We already added 25 if the section exists. Now refine.
    skills = [s.lower() for s in parsed.get("skills", [])]
    missing_critical = [s for s in CRITICAL_SKILLS if s not in skills]
    
    if len(skills) < 5:
        penalty = 10
        score -= penalty
        deductions.append(f"Low skill variety: only {len(skills)} detected (-{penalty} pts)")
    
    if missing_critical:
        # Subtract from the total for missing high-value industry targets
        penalty = min(len(missing_critical) * 3, 15)
        score -= penalty
        deductions.append(f"Missing {len(missing_critical)} critical industry skills (-{penalty} pts)")

    # 3. Experience & Project Realism
    exp = parsed.get("experience", [])
    if len(exp) > 0 and len(exp) < 2:
        score -= 5
        deductions.append("Limited work history (less than 2 roles) (-5 pts)")
        
    proj = parsed.get("projects", [])
    if len(proj) > 0 and len(proj) < 2:
        score -= 5
        deductions.append("Limited project portfolio (-5 pts)")

    # 4. Noise Penalty (New Rule)
    # If raw_text contains too many noise markers that our cleaner had to strip
    raw_text = parsed.get("raw_text", "")
    if "file:///" in raw_text or "Page 1" in raw_text:
        score -= 2
        deductions.append("Document contains avoidable formatting noise / file paths (-2 pts)")

    # 5. Clamp and Label
    final_score = max(0, min(round(score), 100))
    
    if final_score >= 80:
        label = "Strong Match"
    elif final_score >= 60:
        label = "Good Match"
    elif final_score >= 40:
        label = "Fair Match"
    elif final_score >= 20:
        label = "Low Match"
    else:
        label = "Very Low Match"

    # 6. Candidate Profile Inference (Stage A - Stage D Pipeline Support)
    # Seniority Inference
    seniority = "Junior"
    years_xp = len(exp)
    if any(k in raw_text.lower() for k in ["student", "intern", "fresher", "entry level", "university"]):
        seniority = "Student/Intern"
    elif years_xp >= 5 or any(k in raw_text.lower() for k in ["senior", "lead", "architect", "manager"]):
        seniority = "Senior"
    elif years_xp >= 2:
        seniority = "Mid-Level"

    # Domain Inference
    domains = []
    domain_map = {
        "Frontend": ["react", "html", "css", "javascript", "vue", "angular", "frontend", "ui"],
        "Backend": ["python", "node.js", "java", "sql", "api", "flask", "django", "backend"],
        "AI/ML": ["machine learning", "tensorflow", "pytorch", "data science", "nlp"],
        "Data": ["sql", "pandas", "tableau", "power bi", "data analyst", "data engineering"],
        "DevOps": ["aws", "docker", "kubernetes", "ci/cd", "terraform", "jenkins"],
        "Mobile": ["flutter", "react native", "ios", "android", "swift", "kotlin"]
    }
    
    for dom, keywords in domain_map.items():
        if any(k in skills for k in keywords) or any(k in raw_text.lower() for k in keywords):
            domains.append(dom)
    
    if not domains: domains = ["Software Development"]

    return {
        "ats_score":      final_score,
        "ats_label":      label,
        "strengths":      strengths[:5],
        "deductions":     deductions[:6],
        "section_scores": section_scores,
        "missing_skills": missing_critical,
        "inferred_profile": {
            "seniority": seniority,
            "domains":   domains[:3],
            "years_xp":  years_xp
        },
        # Backward compatibility for existing UI
        "suggestions":    deductions[:6],
        "profile_summary": f"ATS Score: {final_score}/100 ({label}). Seniority: {seniority}."
    }
