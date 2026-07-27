from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import uuid

router = APIRouter(prefix="/materials", tags=["materials"])

materials_db: dict[str, dict] = {}


@router.post("/upload")
async def upload_material(
    subject_id: str = Form(...),
    file: UploadFile = File(...),
):
    material_id = str(uuid.uuid4())
    material = {
        "id": material_id,
        "subject_id": subject_id,
        "filename": file.filename,
        "content_type": file.content_type,
    }
    materials_db[material_id] = material
    return material


@router.get("")
def list_materials(subject_id: str = None):
    if subject_id:
        return [m for m in materials_db.values() if m["subject_id"] == subject_id]
    return list(materials_db.values())


@router.delete("/{material_id}")
def delete_material(material_id: str):
    if material_id not in materials_db:
        raise HTTPException(status_code=404, detail="Material not found")
    del materials_db[material_id]
    return {"detail": "Deleted"}
