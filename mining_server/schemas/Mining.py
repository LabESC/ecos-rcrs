from pydantic import BaseModel


class MiningReposRequest(BaseModel):
    environment_id: str
    repos: list[str]
    user: str
    password: str
