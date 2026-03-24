"""
Resume parsing service.

Supports:
  • PDF  – via pdfplumber (preferred) with PyPDF2 fallback
  • DOCX – via python-docx

Extracts: name, email, phone, skills, education, experience, projects
"""

import re
import pdfplumber
import docx
from io import BytesIO

# ── Skill keyword list (extend as needed) ─────────────────────────────────────
KNOWN_SKILLS = [
    # Languages
    "python","java","javascript","typescript","c++","c#","c","go","rust","kotlin",
    "swift","ruby","php","scala","r","matlab","bash","shell",
    # Web
    "react","angular","vue","next.js","nuxt","html","css","tailwind","bootstrap",
    "sass","webpack","vite","graphql","rest","fastapi","django","flask","express",
    "node.js","nodejs","spring","laravel",
    # Data / AI
    "machine learning","deep learning","nlp","computer vision","tensorflow","pytorch",
    "keras","scikit-learn","pandas","numpy","matplotlib","seaborn","opencv",
    "hugging face","transformers","llm","langchain","rag",
    # Cloud / DevOps
    "aws","azure","gcp","docker","kubernetes","ci/cd","github actions","jenkins",
    "terraform","ansible","linux","nginx","redis","rabbitmq","kafka",
    # Databases
    "mongodb","postgresql","mysql","sqlite","firebase","elasticsearch","dynamodb",
    "cassandra","oracle",
    # Tools / Other
    "git","github","jira","figma","postman","swagger","agile","scrum",
    "sql","nosql","excel","tableau","power bi","spark","hadoop",
]

SKILL_PATTERN = re.compile(
    r'\b(' + '|'.join(re.escape(s) for s in KNOWN_SKILLS) + r')\b',
    re.IGNORECASE
)

EMAIL_RE  = re.compile(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}')
PHONE_RE  = re.compile(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,14}[0-9]')
SECTION_HEADERS = {
    "education":   ["education", "academic", "qualification"],
    "experience":  ["experience", "employment", "work history", "internship"],
    "projects":    ["projects", "personal projects", "academic projects"],
    "skills":      ["skills", "technical skills", "core competencies", "technologies"],
}


# ── Public API ─────────────────────────────────────────────────────────────────

def parse_resume(file_bytes: bytes, filename: str) -> dict:
    """
    Entry point. Returns a structured dict with all extracted fields.
    """
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        text = _extract_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        text = _extract_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    return _parse_text(text)


# ── Private helpers ────────────────────────────────────────────────────────────

def _extract_pdf(file_bytes: bytes) -> str:
    text_parts = []
    try:
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    text_parts.append(t)
    except Exception:
        # Fallback to PyPDF2
        import PyPDF2
        reader = PyPDF2.PdfReader(BytesIO(file_bytes))
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    return "\n".join(text_parts)


def _extract_docx(file_bytes: bytes) -> str:
    doc = docx.Document(BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _clean_line(line: str) -> str:
    # remove file:/// file paths, page counters
    if line.startswith("file:///"): return ""
    if re.match(r'^(page\s*)?\d+\s*/\s*\d+$', line, re.IGNORECASE): return ""
    if re.match(r'^page\s+\d+$', line, re.IGNORECASE): return ""
    return line.strip()

def _remove_noise_lines(lines: list[str]) -> list[str]:
    cleaned = []
    seen = set()
    for l in lines:
        cl = _clean_line(l)
        if len(cl) > 3 and cl not in seen:
            cleaned.append(cl)
            seen.add(cl)
    return cleaned

def _parse_text(text: str) -> dict:
    raw_lines = [l.strip() for l in text.splitlines() if l.strip()]
    lines = _remove_noise_lines(raw_lines)

    return {
        "raw_text":   text,
        "name":       _extract_name(lines),
        "email":      _extract_email(text),
        "phone":      _extract_phone(text),
        "skills":     _extract_skills(text),
        "education":  _extract_section(lines, "education"),
        "experience": _extract_section(lines, "experience"),
        "projects":   _extract_section(lines, "projects"),
        "summary":    _build_summary(text),
    }


def _extract_name(lines: list[str]) -> str:
    """Heuristic: first line that looks like a name (2-4 capitalized words, no @)."""
    for line in lines[:6]:
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()) and "@" not in line:
            return line
    return lines[0] if lines else "Unknown"


def _extract_email(text: str) -> str:
    match = EMAIL_RE.search(text)
    return match.group() if match else ""


def _extract_phone(text: str) -> str:
    match = PHONE_RE.search(text)
    return match.group() if match else ""


def _extract_skills(text: str) -> list[str]:
    found = set(m.lower() for m in SKILL_PATTERN.findall(text))
    return sorted(found)


def _extract_section(lines: list[str], section: str) -> list[str]:
    """
    Find the section by its header keywords, collect lines until the next section.
    """
    headers      = SECTION_HEADERS.get(section, [])
    all_headers  = [h for hs in SECTION_HEADERS.values() for h in hs]
    collecting   = False
    results      = []

    for line in lines:
        lower = line.lower()
        if any(h in lower for h in headers):
            collecting = True
            continue
        if collecting:
            if any(h in lower for h in all_headers if not any(h2 in lower for h2 in headers)):
                break
            results.append(line)

    return [r for r in results if len(r) > 3][:15]  # cap at 15 items


def _build_summary(text: str) -> str:
    skills = _extract_skills(text)
    skill_str = ", ".join(skills[:8]) if skills else "various technologies"
    return f"Candidate with skills in {skill_str}. Resume parsed successfully."
