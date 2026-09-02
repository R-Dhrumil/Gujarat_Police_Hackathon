from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class RowValidationResult(BaseModel):
    row_number: int
    is_valid: bool
    data: Dict[str, Any]
    errors: List[str] = []
    warnings: List[str] = []

class BulkImportPreview(BaseModel):
    total_rows: int
    valid_rows_count: int
    invalid_rows_count: int
    valid_rows: List[RowValidationResult]
    invalid_rows: List[RowValidationResult]
    detected_departments: List[str]
    new_departments_to_create: List[str]

class BulkImportConfirmRequest(BaseModel):
    rows: List[Dict[str, Any]]
    auto_create_departments: bool = True
    default_department_id: Optional[int] = None

class BulkImportResult(BaseModel):
    success: bool
    inserted_count: int
    updated_count: int
    failed_count: int
    errors: List[str] = []
