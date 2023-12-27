# ! Imports pra definição de tabelas
from sqlalchemy import Column, String
from database.db import Base

# ! Imports p/ relacionamentos
from sqlalchemy.orm import relationship, Mapped
from typing import List
from model.VotingUserEnvironment import VotingUserEnvironment


# ! Definindo modelo da entidade VotingUsers
class VotingUser(Base):
    __tablename__ = "voting_users"
    __table_args__ = {"schema": "ic"}

    id: str = Column(String(45), primary_key=True, index=True)
    email: str = Column(String(255), nullable=False, unique=True)
    access_code: str = Column(String(8), default=None)

    # ! Relacionamento
    environments: Mapped[List["Environment"]] = relationship(
        "Environment",
        secondary=VotingUserEnvironment.__table__,
        back_populates="voting_users",
    )
