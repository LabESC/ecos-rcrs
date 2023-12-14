from pydantic import BaseModel


class UserBase(BaseModel):
    name: str
    email: str
    password: str


class UserRequest(UserBase):
    ...


class UserResponse(UserBase):
    id: str
    status: str
    _password: str

    class Config:
        orm_mode = True
        exclude = {"password"}


class AuthRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    id: str
    token: str
