from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate


class SubjectService:
    @staticmethod
    def create_subject(
        db: Session,
        faculty_id: UUID,
        subject_data: SubjectCreate,
    ) -> Subject:
        subject = Subject(
            faculty_id=faculty_id,
            **subject_data.model_dump(),
        )

        db.add(subject)
        db.commit()
        db.refresh(subject)

        return subject

    @staticmethod
    def get_subject(
        db: Session,
        subject_id: UUID,
    ) -> Subject | None:
        return db.get(Subject, subject_id)

    @staticmethod
    def get_all_subjects(
        db: Session,
        archived: bool = False,
    ) -> list[Subject]:
        return list(
            db.scalars(
                select(Subject).where(
                    Subject.is_archived == archived
                )
            ).all()
    )
    

    @staticmethod
    def update_subject(
        db: Session,
        subject: Subject,
        subject_data: SubjectUpdate,
    ) -> Subject:
        update_data = subject_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(subject, field, value)

        db.commit()
        db.refresh(subject)

        return subject

    @staticmethod
    def archive_subject(
        db: Session,
        subject: Subject,
    ) -> Subject:
        subject.is_archived = True

        db.commit()
        db.refresh(subject)

        return subject

    @staticmethod
    def restore_subject(
        db: Session,
        subject: Subject,
    ) -> Subject:
        subject.is_archived = False

        db.commit()
        db.refresh(subject)

        return subject

    @staticmethod
    def delete_subject(
        db: Session,
        subject: Subject,
    ) -> None:
        db.delete(subject)
        db.commit()