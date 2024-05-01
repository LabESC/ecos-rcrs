from pydantic import BaseModel


class SVMTfidfRequest(BaseModel):
    issues: list[dict]
    environment_id: str
