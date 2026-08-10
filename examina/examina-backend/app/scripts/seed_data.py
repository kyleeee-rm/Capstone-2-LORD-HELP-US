from app.core.security import hash_password
from app.db.session import SessionLocal

from app.models import Faculty, Subject, SubjectFolder


def main():
    db = SessionLocal()

    try:
        existing = (
            db.query(Faculty)
            .filter(Faculty.email == "seed@examina.local")
            .first()
        )

        if existing:
            print(
                "Seed faculty already exists. "
                "Skipping seed data creation."
            )
            return

        # Seed credentials:
        # Email: seed@examina.local
        # Password: Password123!

        faculty = Faculty(
            email="seed@examina.local",
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
        db.commit()

        print("Seed data created successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
