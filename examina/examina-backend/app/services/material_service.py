from sqlalchemy.orm import Session

from app.models.learning_material import LearningMaterial


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
        db.delete(material)
        db.commit()