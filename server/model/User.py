# ! Imports pra definição de tabelas
from sqlalchemy import Column, String, LargeBinary, DateTime
from sqlalchemy.dialects.postgresql import ENUM
from datetime import datetime
from database.db import Base

# ! Imports p/ relacionamentos
from sqlalchemy.orm import relationship, Mapped
from typing import List


# ! Definindo modelo (tabela) da entidade User
class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "ic"}

    id: str = Column(String(45), primary_key=True, index=True)
    name: str = Column(String(255), nullable=False)
    email: str = Column(String(255), nullable=False, unique=True)
    password: str = Column(LargeBinary, nullable=False)
    token: str = Column(String(45))
    status: str = Column(
        ENUM("active", "inactive", "pending", name="user_status"),
        nullable=False,
        default="pending",
    )
    last_updated: datetime = Column(DateTime, nullable=False, default=datetime.now())

    # ! Relacionamento
    environments: Mapped[List["Environment"]] = relationship(
        "Environment", back_populates="user"
    )
