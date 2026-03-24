"""
LLM-based assistant service safely wrapping Groq API.
Handles deprecated model retries, graceful fallbacks, and context injection.
"""

import os
import json
import logging
from groq import Groq, APIStatusError, BadRequestError

logger = logging.getLogger(__name__)

# Primary and Fallback configuring
PRIMARY_MODEL  = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
FALLBACK_MODEL = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")

def getGroqClient():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key)

def callGroqChat(messages: list, options: dict = None):
    client = getGroqClient()
    if not client:
        return "⚠️ **Groq API Key is missing.**\n\nPlease check your `backend/.env` file."
    
    opts = options or {}
    model = opts.get("model", PRIMARY_MODEL)
    
    try:
        response = client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=0.7,
            max_tokens=1000
        )
        return response.choices[0].message.content
        
    except (APIStatusError, BadRequestError) as e:
        logger.warning(f"Groq API error on model {model}: {str(e)}. Retrying with fallback {FALLBACK_MODEL}.")
        # Retry with fallback model
        try:
            fallback_response = client.chat.completions.create(
                messages=messages,
                model=FALLBACK_MODEL,
                temperature=0.7,
                max_tokens=1000
            )
            return fallback_response.choices[0].message.content
        except Exception as fallback_e:
            logger.error(f"Fallback model also failed: {str(fallback_e)}. Trying final safety model (llama3-8b).")
            # Final attempt with the most common model
            try:
                final_response = client.chat.completions.create(
                    messages=messages,
                    model="llama3-8b-8192",
                    temperature=0.7,
                    max_tokens=1000
                )
                return final_response.choices[0].message.content
            except:
                return "⚠️ AI assistant is temporarily unavailable due to a service error. Please try again shortly."
            
    except Exception as e:
        logger.error(f"Unknown Groq error: {str(e)}")
        return "⚠️ An unexpected error occurred while communicating with the AI. Please try again later."


def get_answer(query: str, resume_data: dict, jobs: list[dict]) -> str:
    """Answers natural language questions using strictly cleaned context data."""
    top_jobs = sorted(jobs, key=lambda j: j.get("match_score", 0), reverse=True)[:5]
    
    # Safe context object extraction
    context = {
        "candidate_name": resume_data.get("name", "The Candidate"),
        "cleaned_skills": resume_data.get("skills", []),
        "education": resume_data.get("education", []),
        "experience": resume_data.get("experience", []),
        "projects": resume_data.get("projects", []),
        "ats_score": resume_data.get("ats_score", "N/A"),
        "ats_deductions": resume_data.get("deductions", []),
        "missing_skills": resume_data.get("missing_skills", []),
        "recommended_jobs": [
            {
                "title": j.get("title"), 
                "company": j.get("company"), 
                "match_score": j.get("match_score"),
                "match_label": j.get("match_label"),
                "job_match_reasons": j.get("relevance_reasons", [])
            } 
            for j in top_jobs
        ]
    }
    
    prompt = f"""You are a top-tier AI career assistant working inside a Resume Analyzer dashboard.
Using ONLY the candidate's strictly parsed data below:
{json.dumps(context, indent=2)}

USER QUERY: "{query}"

INSTRUCTIONS:
1. Act as a professional, encouraging career coach.
2. Directly answer the query using ONLY the provided resume data and top job matches.
3. Personalize your response based on their exact skills and ATS details.
4. If asked "Which skills am I missing?", generate critical Missing Skills and Nice-to-Have Skills based on the `recommended_jobs` required skills vs their `cleaned_skills`. Add priority (High/Medium/Low), explain why it's needed, and suggest a way to learn it securely. Do NOT list skills they already have.
5. Provide concise, actionable, bulleted insights without generic filler.
6. Do NOT invent fake jobs, fake score reasoning, or fake technical skills.
"""
    
    return callGroqChat([{"role": "user", "content": prompt}])
