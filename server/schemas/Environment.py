from pydantic import BaseModel
from typing import Optional


class EnvironmentDataBase(BaseModel):
    repos: list[str]
    mining_type: str
    organization_name: Optional[str] = None
    mining_data: Optional[list[dict]] = None
    topic_data: Optional[list[dict]] = None
    priority_data: Optional[list[dict]] = None
    final_rcr: Optional[list[dict]] = None


class EnvironmentBase(BaseModel):
    user_id: str
    name: str
    details: str
    data: EnvironmentDataBase


class EnvironmentRequest(EnvironmentBase):
    ...


class EnvironmentResponse(EnvironmentBase):
    id: str
    status: str

    class Config:
        from_attributes = True


class EnvironmentResponseFiltered(BaseModel):
    id: str
    name: str
    details: str
    status: str
