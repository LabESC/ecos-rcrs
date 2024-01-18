from typing import Annotated
from pydantic import BaseModel, Field


class UserBase(BaseModel):
    name: str
    email: str
    password: str


class UserRequest(UserBase):
    ...


class UserResponse(UserBase):
    id: str
    status: str
    password: Annotated[str, Field(exclude=True)]

    class Config:
        from_attributes = True


class AuthRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    id: str
    token: str


class PasswordRequest(BaseModel):
    password: str
    token: str
