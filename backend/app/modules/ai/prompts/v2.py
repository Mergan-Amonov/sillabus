PROMPT_VERSION = "v2"

LANGUAGE_INSTRUCTIONS = {
    "uzbek": "Barcha kontentni O'ZBEK TILIDA yoz.",
    "russian": "Весь контент пиши НА РУССКОМ ЯЗЫКЕ.",
    "english": "Write ALL content IN ENGLISH.",
}

SYSTEM_PROMPT = """You are an expert academic curriculum designer for Uzbekistan universities.
Output ONLY valid JSON — no markdown, no extra text, no code fences.
Be concise. Keep each field short (1-2 sentences max for text fields).
Follow the exact JSON structure provided."""

SYLLABUS_GENERATE_TEMPLATE = """{language_instruction}

Generate a university syllabus for:
Course: {course_title} ({course_code}), {credit_hours} credits, {level}
Department: {department} | Faculty: {faculty}
Language: {language} | Semester: {semester} | Year: {academic_year}
Hours/week: Lecture={lecture_hours}, Practice={practice_hours}, Lab={lab_hours}, Self-study={self_study_hours}
Prerequisites: {prerequisites}
Instructions: {instructions}

Return ONLY this JSON (be concise, max 1-2 sentences per text field):
{{
  "course_description": "2-3 sentence overview of the course.",

  "learning_outcomes": [
    "Outcome 1",
    "Outcome 2",
    "Outcome 3",
    "Outcome 4",
    "Outcome 5"
  ],

  "competencies": ["Competency 1", "Competency 2", "Competency 3"],

  "weekly_schedule": [
    {{
      "week": 1,
      "topic": "Topic name",
      "lecture_content": "Brief lecture description.",
      "practice_content": "Brief practice task.",
      "self_study": "Reading/task.",
      "hours": {{"lecture": {default_lecture_h}, "practice": {default_practice_h}, "self_study": {default_self_study_h}}}
    }}
  ],

  "grading_policy": {{
    "current_control": 30,
    "midterm": 30,
    "final": 40
  }},

  "attendance_policy": "One sentence attendance rule.",

  "passing_grade": 55,

  "textbooks": [
    {{"title": "Title", "author": "Author", "year": 2023, "publisher": "Publisher", "required": true}}
  ],

  "online_resources": [
    {{"name": "Name", "url": "https://example.com", "description": "Brief description."}}
  ],

  "assessment_breakdown": [
    {{"type": "Current control", "weight": 30, "description": "Quizzes and homework"}},
    {{"type": "Midterm", "weight": 30, "description": "Written midterm exam"}},
    {{"type": "Final", "weight": 40, "description": "Written final exam"}}
  ]
}}

Generate exactly {total_weeks} entries in weekly_schedule."""
