from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.learning_material import LearningMaterial
from app.models.subject import Subject
from app.models.subject_folder import SubjectFolder
from app.schemas.subject_folder import (
    SubjectFolderCreate,
    SubjectFolderUpdate,
)
from app.services.material_service import MaterialService


class SubjectFolderService:
    @staticmethod
    def create_folder(
        db: Session,
        subject: Subject,
        folder_data: SubjectFolderCreate,
    ) -> SubjectFolder:
        folder = SubjectFolder(
            subject_id=subject.subject_id,
            folder_name=folder_data.folder_name,
            description=folder_data.description,
        )

        db.add(folder)
        db.commit()
        db.refresh(folder)

        return folder

    @staticmethod
    def get_folder(
        db: Session,
        folder_id,
    ) -> SubjectFolder | None:
        return db.get(SubjectFolder, folder_id)

    @staticmethod
    def get_all_folders(
        db: Session,
    ) -> list[SubjectFolder]:
        return list(
            db.scalars(
                select(SubjectFolder)
            ).all()
        )

    @staticmethod
    def update_folder(
        db: Session,
        folder: SubjectFolder,
        folder_data: SubjectFolderUpdate,
    ) -> SubjectFolder:
        update_data = folder_data.model_dump(
            exclude_unset=True
        )

        for field, value in update_data.items():
            setattr(folder, field, value)

        db.commit()
        db.refresh(folder)

        return folder

    @staticmethod
    def delete_folder(
        db: Session,
        folder: SubjectFolder,
    ) -> None:
        materials = db.scalars(
            select(LearningMaterial).where(
                LearningMaterial.folder_id == folder.folder_id,
            )
        ).all()

        for material in materials:
            MaterialService.delete_material(
                db=db,
                material=material,
            )

        db.delete(folder)
        db.commit()