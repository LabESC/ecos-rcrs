from pydantic import BaseModel


class VotingUserBase(BaseModel):
    email: str


class VotingUserRequest(VotingUserBase):
    ...
