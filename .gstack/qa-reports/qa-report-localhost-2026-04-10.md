# QA Report — Silabuys — 2026-04-10

**URL:** http://localhost:3000  
**Branch:** main  
**Scope:** Syllabus yaratishda xatolik (syllabus creation error)  
**Duration:** ~20 minutes | **Tests:** 34/34 pass  

## Summary

| Metric | Value |
|--------|-------|
| Issues found | 4 (2 critical, 1 high, 1 medium) |
| Fixed | 3 verified |
| Deferred | 1 (data — needs admin action) |
| Health score | 45 → 82 |

---

## ISSUE-001 — No GET /auth/universities endpoint [Critical] — FIXED `49f766d`

All self-registered users could not create syllabuses. Root cause: registration had no university
selector because no API existed to list universities. POST /auth/universities (admin-only) existed
but not GET.

Fix: Added GET /auth/universities (public, no auth required).

---

## ISSUE-002 — Registration form has no university selector [Critical] — FIXED `26317f3`

100% of self-registered users got university_id=null. On first syllabus create: 422 error.

Fix: University <select> populated from GET /auth/universities. Error handler now shows actual
API detail instead of generic string.

Affected DB users (need manual admin fix): salom@test.uz, test_qa@example.com

---

## ISSUE-003 — Zod password min(6) vs backend min(8)+uppercase+digit [High] — FIXED `26317f3`

Frontend accepted weak passwords that backend rejected with 422 and a generic error message.

Fix: Zod schema updated to match backend rules exactly.

---

## ISSUE-004 — Existing users without university still blocked [Medium] — DEFERRED

salom@test.uz and test_qa@example.com have university_id=null. Need admin to assign via:
/dashboard/users or SQL: UPDATE users SET university_id='...' WHERE university_id IS NULL.

---

## Regression Tests

tests/test_auth.py::test_list_universities_public — PASS
tests/test_auth.py::test_register_with_university_can_create_syllabus — PASS
Full suite: 34/34

---

PR summary: QA found 4 issues, fixed 3, health 45→82. Root cause: self-registered users
never got a university, blocking syllabus creation. Fixed with GET /universities endpoint
and university selector on registration form.
