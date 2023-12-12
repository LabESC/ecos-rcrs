from pydantic import BaseModel


class UserBase(BaseModel):
    name: str
    email: str
    password: str


class UserRequest(UserBase):
    ...


class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True
