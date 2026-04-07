import io
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.exceptions import NotFoundError, ForbiddenError
from app.modules.auth.models import User, UserRole
from app.modules.syllabus.models import Syllabus, SyllabusStatus


async def get_syllabus_for_export(syllabus_id: UUID, user: User, db: AsyncSession) -> Syllabus:
    result = await db.execute(select(Syllabus).where(Syllabus.id == syllabus_id))
    syllabus = result.scalar_one_or_none()
    if not syllabus:
        raise NotFoundError("Syllabus")

    if user.role == UserRole.TEACHER and syllabus.created_by != user.id:
        raise ForbiddenError("Access denied")
    if user.role in (UserRole.REVIEWER, UserRole.UNIVERSITY_ADMIN):
        if syllabus.university_id != user.university_id:
            raise ForbiddenError("Access denied")

    if syllabus.status not in (SyllabusStatus.APPROVED, SyllabusStatus.PENDING_REVIEW):
        if user.role == UserRole.TEACHER and syllabus.created_by == user.id:
            pass  # teacher can export own draft
        else:
            raise ForbiddenError("Only approved or pending syllabuses can be exported")

    return syllabus


def generate_pdf(syllabus: Syllabus) -> bytes:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=16, spaceAfter=12)
    story.append(Paragraph(syllabus.title, title_style))

    # Meta info table
    meta = [
        ["Course Code:", syllabus.course_code],
        ["Credit Hours:", str(syllabus.credit_hours)],
        ["Status:", syllabus.status.value.replace("_", " ").title()],
    ]
    meta_table = Table(meta, colWidths=[5 * cm, 10 * cm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.5 * cm))

    # Description
    if syllabus.description:
        story.append(Paragraph("Course Description", styles["Heading2"]))
        story.append(Paragraph(syllabus.description, styles["Normal"]))
        story.append(Spacer(1, 0.3 * cm))

    # Objectives
    if syllabus.objectives:
        story.append(Paragraph("Learning Objectives", styles["Heading2"]))
        story.append(Paragraph(syllabus.objectives, styles["Normal"]))
        story.append(Spacer(1, 0.3 * cm))

    # Weekly content
    content = syllabus.content or {}
    weeks = content.get("weeks", [])
    if weeks:
        story.append(Paragraph("Course Schedule", styles["Heading2"]))
        week_data = [["Week", "Topic", "Activities"]]
        for w in weeks:
            activities = ", ".join(w.get("activities", [])) if isinstance(w.get("activities"), list) else str(w.get("activities", ""))
            week_data.append([str(w.get("week", "")), w.get("topic", ""), activities])

        week_table = Table(week_data, colWidths=[1.5 * cm, 8 * cm, 6 * cm])
        week_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563EB")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F4F6")]),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(week_table)

    doc.build(story)
    return buffer.getvalue()


def generate_docx(syllabus: Syllabus) -> bytes:
    from docx import Document
    from docx.shared import Pt, RGBColor, Cm
    from docx.enum.text import WD_ALIGN_PARAGRAPH

    doc = Document()

    # Title
    title_para = doc.add_heading(syllabus.title, level=0)
    title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Meta
    meta_table = doc.add_table(rows=3, cols=2)
    meta_table.style = "Table Grid"
    meta_data = [
        ("Course Code", syllabus.course_code),
        ("Credit Hours", str(syllabus.credit_hours)),
        ("Status", syllabus.status.value.replace("_", " ").title()),
    ]
    for i, (label, value) in enumerate(meta_data):
        meta_table.rows[i].cells[0].text = label
        meta_table.rows[i].cells[1].text = value
        meta_table.rows[i].cells[0].paragraphs[0].runs[0].bold = True

    doc.add_paragraph()

    # Description
    if syllabus.description:
        doc.add_heading("Course Description", level=1)
        doc.add_paragraph(syllabus.description)

    # Objectives
    if syllabus.objectives:
        doc.add_heading("Learning Objectives", level=1)
        doc.add_paragraph(syllabus.objectives)

    # Weekly schedule
    content = syllabus.content or {}
    weeks = content.get("weeks", [])
    if weeks:
        doc.add_heading("Course Schedule", level=1)
        schedule_table = doc.add_table(rows=1 + len(weeks), cols=3)
        schedule_table.style = "Table Grid"
        headers = schedule_table.rows[0].cells
        for i, h in enumerate(["Week", "Topic", "Activities"]):
            headers[i].text = h
            headers[i].paragraphs[0].runs[0].bold = True

        for i, w in enumerate(weeks):
            row = schedule_table.rows[i + 1].cells
            activities = ", ".join(w.get("activities", [])) if isinstance(w.get("activities"), list) else ""
            row[0].text = str(w.get("week", ""))
            row[1].text = w.get("topic", "")
            row[2].text = activities

    # Assessment breakdown
    breakdown = content.get("assessment_breakdown", {})
    if breakdown:
        doc.add_heading("Assessment Breakdown", level=1)
        for key, val in breakdown.items():
            doc.add_paragraph(f"{key.replace('_', ' ').title()}: {val}%", style="List Bullet")

    buffer = io.BytesIO()
    doc.save(buffer)
    return buffer.getvalue()
