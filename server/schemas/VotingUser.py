from pydantic import BaseModel


class VotingUserBase(BaseModel):
    email: str


class VotingUserRequest(VotingUserBase):
    ...


class VotingUserResponse(VotingUserBase):
    id: str

    class Config:
        from_attributes = True


class VotingUserVote(BaseModel):
    vote: list[dict]
    token: str
