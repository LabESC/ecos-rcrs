from pydantic import BaseModel


class TopicReposRequest(BaseModel):
    issues: list[dict]
    environment_id: str
