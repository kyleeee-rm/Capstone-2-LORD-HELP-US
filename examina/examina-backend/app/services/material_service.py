from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.learning_material import LearningMaterial
from app.models.material_chunk import MaterialChunk
from app.models.subject_folder import SubjectFolder
from app.services import storage
from app.services.ai_provider import get_embedding_metadata
from app.services.chroma import get_subject_collection


class MaterialService:
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
            embedding_meta = get_embedding_metadata()
            collection = get_subject_collection(
                subject_id=str(folder.subject_id),
                embedding_model=embedding_meta["embedding_model"],
                embedding_dimension=embedding_meta["embedding_dimension"],
            )

            collection.delete(
                ids=chroma_ids,
            )

        storage.delete_file(
            material.storage_path,
        )

        db.delete(material)
        db.commit()
