"""
inquisitive_routes.py — Inquisitive Kid module API
Endpoints:
  GET  /api/inquisitive/videos/{class_id}          → list videos for class
  GET  /api/inquisitive/video/{video_id}           → single video + quiz
  GET  /api/inquisitive/tricks/{class_id}          → maths tricks for class
  POST /api/inquisitive/exercises/generate         → AI generates 5 daily questions
  POST /api/inquisitive/exercises/submit           → save answers, award stars
  GET  /api/inquisitive/progress/{user_id}         → user's inquisitive progress
  POST /api/inquisitive/video/complete             → mark video watched, save quiz score
"""
import json, logging, uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/inquisitive")

# ── Load static content ───────────────────────────────────────────────────────
DATA_DIR = Path(__file__).parent / "data"

def _load_json(filename: str) -> dict:
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)

CONTENT     = _load_json("inquisitive_content.json")
TRICKS_DATA = _load_json("maths_tricks.json")

# Build lookup dicts
VIDEOS_BY_ID   = {v["id"]: v for v in CONTENT["videos"]}
TRICKS_BY_ID   = {t["id"]: t for t in TRICKS_DATA["tricks"]}
CATEGORIES_BY_ID = {c["id"]: c for c in CONTENT["categories"]}

IST_OFFSET = timedelta(hours=5, minutes=30)

def ist_today() -> str:
    return (datetime.now(timezone.utc) + IST_OFFSET).strftime("%Y-%m-%d")

def class_level_num(class_id: str) -> int:
    order = ["lkg","ukg","class1","class2","class3","class4","class5"]
    return order.index(class_id) if class_id in order else 2

# ── Pydantic models ───────────────────────────────────────────────────────────
class ExerciseGenerateRequest(BaseModel):
    user_id: str
    class_id: str
    character: str = "cat"

class ExerciseSubmitRequest(BaseModel):
    user_id: str
    exercise_id: str
    answers: List[int]   # index of chosen answer per question
    time_taken_seconds: int = 60

class VideoCompleteRequest(BaseModel):
    user_id: str
    video_id: str
    quiz_answers: List[int]   # answer indices for 3 questions
    watch_duration_seconds: int

# ── Helper: filter by class ───────────────────────────────────────────────────
def videos_for_class(class_id: str) -> list:
    level = class_level_num(class_id)
    return [v for v in CONTENT["videos"] if class_id in v.get("class_groups", [])]

def tricks_for_class(class_id: str) -> list:
    return [t for t in TRICKS_DATA["tricks"] if class_id in t.get("class_groups", [])]

# ── GET /videos/{class_id} ────────────────────────────────────────────────────
@router.get("/videos/{class_id}")
async def get_videos_for_class(class_id: str, category: Optional[str] = None):
    """List all videos available for a class, optionally filtered by category."""
    videos = videos_for_class(class_id)
    if category:
        videos = [v for v in videos if v.get("category") == category]

    # Return summarized (no quiz questions in list view)
    result = []
    for v in videos:
        cat = CATEGORIES_BY_ID.get(v["category"], {})
        result.append({
            "id":           v["id"],
            "title":        v["title"],
            "fact":         v["fact"],
            "category":     v["category"],
            "category_name": cat.get("name",""),
            "category_emoji": cat.get("emoji",""),
            "difficulty":   v.get("difficulty", 1),
            "duration_sec": v.get("duration_sec", 240),
            "has_quiz":     len(v.get("quiz_questions",[])) > 0,
        })
    return {
        "class_id":   class_id,
        "total":      len(result),
        "categories": [
            {"id": c["id"], "name": c["name"], "emoji": c["emoji"],
             "count": sum(1 for v in result if v["category"]==c["id"])}
            for c in CONTENT["categories"]
            if any(v["category"]==c["id"] for v in result)
        ],
        "videos": result
    }

# ── GET /video/{video_id} ─────────────────────────────────────────────────────
@router.get("/video/{video_id}")
async def get_single_video(video_id: str):
    """Get a single video with full quiz questions."""
    v = VIDEOS_BY_ID.get(video_id)
    if not v:
        raise HTTPException(status_code=404, detail="Video not found")
    cat = CATEGORIES_BY_ID.get(v["category"], {})
    return {**v, "category_name": cat.get("name",""), "category_emoji": cat.get("emoji",""),
            "category_color": cat.get("color","#6366F1")}

# ── GET /tricks/{class_id} ────────────────────────────────────────────────────
@router.get("/tricks/{class_id}")
async def get_tricks_for_class(class_id: str):
    """Get all maths tricks for a class."""
    tricks = tricks_for_class(class_id)
    return {
        "class_id": class_id,
        "total":    len(tricks),
        "tricks":   tricks
    }

# ── POST /exercises/generate ──────────────────────────────────────────────────
async def _generate_ai_exercises(class_id: str, openai_client: AsyncOpenAI) -> list:
    """Use GPT-4o-mini to generate 5 fresh daily questions."""
    class_names = {
        "lkg": "Lower Kindergarten (age 3-4)", "ukg": "Upper Kindergarten (age 4-5)",
        "class1": "Class 1 (age 5-6)", "class2": "Class 2 (age 6-7)",
        "class3": "Class 3 (age 7-8)", "class4": "Class 4 (age 8-9)",
        "class5": "Class 5 (age 9-10)"
    }
    class_name = class_names.get(class_id, "Class 3")

    prompt = f"""Create exactly 5 fun daily exercise questions for a child in {class_name}.
Mix: 2 English vocabulary/grammar, 2 Maths, 1 General Knowledge.
Each question must have exactly 4 options and one correct answer (0-indexed).
Return ONLY valid JSON array, no markdown, no explanation:
[
  {{"subject":"english","question":"...","options":["A","B","C","D"],"correct_index":0,"explanation":"..."}},
  ...5 items total
]
Make questions appropriate, fun, and encouraging. Use simple English."""

    resp = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=800, temperature=0.7
    )
    raw = resp.choices[0].message.content.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


@router.post("/exercises/generate")
async def generate_daily_exercises(req: ExerciseGenerateRequest):
    """
    Generate 5 fresh AI questions for today.
    Checks if already generated today (returns cached if so).
    Requires db and openai_client to be injected via app state.
    """
    from fastapi import Request
    # Note: db and openai_client are accessed via the main app's globals
    # This function is called from server.py which has them in scope
    raise HTTPException(status_code=501, detail="Call via server.py route")

# ── POST /video/complete ──────────────────────────────────────────────────────
@router.post("/video/complete")
async def mark_video_complete(req: VideoCompleteRequest):
    raise HTTPException(status_code=501, detail="Call via server.py route")
