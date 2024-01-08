# ! Imports pra definição de tabelas
from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from datetime import datetime

# ! Imports p/ relacionamentos
from database.db import Base
from sqlalchemy.orm import relationship, Mapped
from typing import List
from model.VotingUserEnvironment import VotingUserEnvironment


# ! Definindo modelo (tabela) da entidade Environments
class Environment(Base):
    __tablename__ = "environments"
    __table_args__ = {"schema": "ic"}

    id: str = Column(String(45), primary_key=True, index=True)
    user_id: str = Column(String(45), ForeignKey("ic.users.id"), nullable=False)
    name: str = Column(String(255), nullable=False)
    details: dict = Column(JSONB, nullable=False)
    repos: list[str] = Column(JSONB, nullable=False)
    mining_type: str = Column(
        ENUM("organization", "repos", name="mining_type"), nullable=False
    )
    organization_name: str = Column(String(255))
    mining_data: list[dict] = Column(JSONB)
    topic_data: list[dict] = Column(JSONB)
    priority_data: list[dict] = Column(JSONB)
    final_rcr: list[dict] = Column(JSONB)
    status: str = Column(
        ENUM(
            "mining",
            "mining_done",
            "making_topics",
            "topics_done",
            "waiting_rcr_voting",
            "rcr_voting_done",
            "waiting_rcr_priority",
            "rcr_priority_done",
            "done",
            name="environment_status",
        ),
        nullable=False,
        default="mining",
    )
    last_updated: datetime = Column(DateTime, nullable=False, default=datetime.now())

    # ! Relacionamentos
    user: Mapped[List["User"]] = relationship("User", back_populates="environments")
    voting_users: Mapped[List["VotingUser"]] = relationship(
        "VotingUser",
        secondary=VotingUserEnvironment.__table__,
        back_populates="environments",
    )
