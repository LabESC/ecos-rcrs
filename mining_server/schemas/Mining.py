from pydantic import BaseModel


class MiningReposRequest(BaseModel):
    repos: list[str]
    user: str
    password: str
