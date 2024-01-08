from pydantic import BaseModel


class TopicReposRequest(BaseModel):
    issues: list[dict]
    user: str
    password: str
