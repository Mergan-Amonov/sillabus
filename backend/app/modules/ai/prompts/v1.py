PROMPT_VERSION = "v1"

SYSTEM_PROMPT = """You are an expert academic curriculum designer specializing in university-level course syllabuses.
You help teachers create well-structured, comprehensive syllabuses that meet academic standards.
Always respond in the same language the user writes in (Uzbek or English).
Output ONLY valid JSON — no markdown, no extra text."""

SYLLABUS_GENERATE_TEMPLATE = """Generate a detailed university syllabus for the following course:

Course Title: {course_title}
Course Code: {course_code}
Credit Hours: {credit_hours}
Level: {level}
Department: {department}
Additional Instructions: {instructions}

Return a JSON object with this exact structure:
{{
  "title": "Full course title",
  "description": "2-3 paragraph course description",
  "objectives": "Bullet-point learning objectives (5-8 items)",
  "content": {{
    "weeks": [
      {{
        "week": 1,
        "topic": "Topic name",
        "description": "Brief description",
        "activities": ["Lecture", "Reading"],
        "assessment": "Quiz/Assignment/None"
      }}
    ],
    "assessment_breakdown": {{
      "midterm": 30,
      "final": 40,
      "assignments": 20,
      "attendance": 10
    }},
    "required_textbooks": ["Book title - Author, Year"],
    "recommended_resources": ["Resource description"]
  }}
}}"""
