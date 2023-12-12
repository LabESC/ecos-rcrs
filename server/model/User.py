from sqlalchemy import Column, String, Boolean

from database.db import Base


# ! Definindo modelo da entidade Users
class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "ic"}

    id: str = Column(String(45), primary_key=True, index=True)
    name: str = Column(String(255), nullable=False)
    email: str = Column(String(255), nullable=False)
    password: str = Column(String(255), nullable=False)
    active: bool = Column(Boolean, nullable=False)
