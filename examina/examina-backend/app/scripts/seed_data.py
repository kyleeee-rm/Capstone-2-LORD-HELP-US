from app.core.security import hash_password
from app.db.session import SessionLocal

from app.models import Faculty, Subject, SubjectFolder, QuestionBank
from app.models.question_bank import BloomLevel, QuestionType


def main():
    db = SessionLocal()

    try:
        existing = (
            db.query(Faculty)
            .filter(Faculty.email == "seed@examina.dev")
            .first()
        )

        if existing:
            print(
                "Seed faculty already exists. "
                "Skipping seed data creation."
            )
            return

        # Seed credentials:
        # Email: seed@examina.dev
        # Password: Password123!

        faculty = Faculty(
            email="seed@examina.dev",
            password_hash=hash_password("Password123!"),
            first_name="Test",
            last_name="Faculty",
            role="faculty",
            status="active",
        )

        db.add(faculty)
        db.flush()

        subjects = [
            Subject(
                faculty_id=faculty.faculty_id,
                subject_code="CS321",
                subject_name="Software Engineering",
                course="BSCS",
                year_level="3",
                semester="1st",
                academic_year="2025-2026",
            ),
            Subject(
                faculty_id=faculty.faculty_id,
                subject_code="CS322",
                subject_name="Database Systems",
                course="BSCS",
                year_level="3",
                semester="1st",
                academic_year="2025-2026",
            ),
        ]

        db.add_all(subjects)
        db.flush()

        folders = []

        for subject in subjects:
            for folder_name in [
                "Week 1",
                "Week 2",
                "Week 3",
                "Exams",
            ]:
                folders.append(
                    SubjectFolder(
                        subject_id=subject.subject_id,
                        folder_name=folder_name,
                        description=f"Seed folder: {folder_name}",
                    )
                )

        db.add_all(folders)
        db.flush()

        # Question Bank seed data - deliberately reuses the same "Week N"
        # vocabulary as the folders above (no real LearningMaterial/
        # lesson_label seeded yet to hook onto, since QuestionBank.lesson
        # is free-text with no FK - matching pattern, not literal linkage).
        # Mix of statuses so filtering behavior is actually testable:
        # only "approved" should ever surface in search/sufficiency-check.
        software_eng, database_sys = subjects

        questions = [
            QuestionBank(
                subject_id=software_eng.subject_id,
                lesson="Week 1",
                question_text="What is the primary goal of the Software Development Life Cycle (SDLC)?",
                bloom_level=BloomLevel.remembering,
                question_type=QuestionType.multiple_choice,
                choices={
                    "A": "To increase project cost",
                    "B": "To provide a structured approach to software development",
                    "C": "To eliminate the need for testing",
                    "D": "To replace developers with automation",
                },
                correct_answer="B",
                source="manual",
                status="approved",
            ),
            QuestionBank(
                subject_id=software_eng.subject_id,
                lesson="Week 1",
                question_text="Explain why requirements gathering is considered a critical phase in SDLC.",
                bloom_level=BloomLevel.understanding,
                question_type=QuestionType.multiple_choice,
                choices={
                    "A": "It has no impact on later phases",
                    "B": "Errors here are the cheapest to fix",
                    "C": "Errors here become progressively more expensive to fix later",
                    "D": "It is optional in Agile methodologies",
                },
                correct_answer="C",
                source="manual",
                status="approved",
            ),
            QuestionBank(
                subject_id=software_eng.subject_id,
                lesson="Week 2",
                question_text="The Waterfall model allows revisiting a previous phase once the next phase has started.",
                bloom_level=BloomLevel.understanding,
                question_type=QuestionType.true_false,
                choices=None,
                correct_answer="False",
                source="manual",
                status="approved",
            ),
            QuestionBank(
                subject_id=software_eng.subject_id,
                lesson="Week 2",
                question_text="Apply Agile principles to justify why sprint retrospectives improve team velocity over time.",
                bloom_level=BloomLevel.applying,
                question_type=QuestionType.multiple_choice,
                choices={
                    "A": "They have no measurable effect",
                    "B": "They identify process issues for continuous improvement",
                    "C": "They are purely administrative",
                    "D": "They replace sprint planning",
                },
                correct_answer="B",
                source="ai_generated",
                # Deliberately left pending - proves search/sufficiency-check
                # correctly EXCLUDE unapproved questions, not just that
                # approved ones show up.
                status="pending",
            ),
            QuestionBank(
                subject_id=database_sys.subject_id,
                lesson="Week 1",
                question_text="What does ACID stand for in the context of database transactions?",
                bloom_level=BloomLevel.remembering,
                question_type=QuestionType.multiple_choice,
                choices={
                    "A": "Atomicity, Consistency, Isolation, Durability",
                    "B": "Access, Control, Integrity, Data",
                    "C": "Aggregation, Caching, Indexing, Deployment",
                    "D": "Authentication, Certification, Identity, Data",
                },
                correct_answer="A",
                source="manual",
                status="approved",
            ),
            QuestionBank(
                subject_id=database_sys.subject_id,
                lesson="Week 1",
                question_text="A primary key can contain NULL values.",
                bloom_level=BloomLevel.remembering,
                question_type=QuestionType.true_false,
                choices=None,
                correct_answer="False",
                source="manual",
                status="approved",
            ),
            QuestionBank(
                subject_id=database_sys.subject_id,
                lesson="Week 3",
                question_text="Analyze why normalizing a database to 3NF can improve data integrity but potentially reduce query performance.",
                bloom_level=BloomLevel.analyzing,
                question_type=QuestionType.multiple_choice,
                choices={
                    "A": "Normalization has no effect on performance",
                    "B": "Reduced redundancy improves integrity; more joins can reduce read speed",
                    "C": "Normalization always improves both integrity and performance equally",
                    "D": "3NF eliminates the need for indexes",
                },
                correct_answer="B",
                source="ai_generated",
                status="approved",
            ),
        ]

        db.add_all(questions)
        db.commit()

        print("Seed data created successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
