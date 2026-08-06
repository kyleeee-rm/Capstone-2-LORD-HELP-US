from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.learning_material import LearningMaterial
from app.models.material_chunk import MaterialChunk
from app.models.subject_folder import SubjectFolder
from app.services import storage
from app.services.ai_provider.config import settings as ai_settings
from app.services.chroma import get_subject_collection


class MaterialService:
    @staticmethod
    def archive_material(
        db: Session,
        material: LearningMaterial,
    ) -> LearningMaterial:
        material.is_archived = True

        db.commit()
        db.refresh(material)

        return material

    @staticmethod
    def restore_material(
        db: Session,
        material: LearningMaterial,
    ) -> LearningMaterial:
        material.is_archived = False

        db.commit()
        db.refresh(material)

        return material

    @staticmethod
    def delete_material(
        db: Session,
        material: LearningMaterial,
    ) -> None:
        folder = db.get(
            SubjectFolder,
            material.folder_id,
        )

        if folder is None:
            raise ValueError("Subject folder not found.")

        chunks = db.scalars(
            select(MaterialChunk).where(
                MaterialChunk.material_id == material.material_id
            )
        ).all()

        chroma_ids = [
            chunk.chroma_vector_id
            for chunk in chunks
        ]

        if chroma_ids:
            collection = get_subject_collection(
                subject_id=str(folder.subject_id),
                embedding_model=ai_settings.EMBEDDING_MODEL,
                embedding_dimension=ai_settings.EMBEDDING_DIMENSION,
            )

            collection.delete(
                ids=chroma_ids,
            )

        storage.delete_file(
            material.storage_path,
        )

        db.delete(material)
        db.commit()