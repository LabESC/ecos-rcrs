from sqlalchemy import Column, String, Boolean  # , Enum
from sqlalchemy.dialects.postgresql import ENUM
from database.db import Base


# ! Definindo modelo da entidade Users
class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "ic"}

    id: str = Column(String(45), primary_key=True, index=True)
    name: str = Column(String(255), nullable=False)
    email: str = Column(String(255), nullable=False, unique=True)
    password: str = Column(String(255), nullable=False)
    status: str = Column(
        ENUM("active", "inactive", "pending", name="user_status"),
        nullable=False,
        default="pending",
    )
