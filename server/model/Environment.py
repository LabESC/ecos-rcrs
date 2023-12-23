from sqlalchemy import Column, String, ForeignKey  # , Enum
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from database.db import Base


# ! Definindo modelo da entidade Users
class Environment(Base):
    __tablename__ = "environment"
    __table_args__ = {"schema": "ic"}

    id: str = Column(String(45), primary_key=True, index=True)
    user_id: Column(String(45), ForeignKey("user.id"), nullable=False)
    dados: dict = Column(JSONB)
    status: str = Column(
        ENUM(
            "mining",
            "mining_done",
            "making_topics",
            "topics_done",
            "waiting_srm_voting",
            "srm_voting_done",
            "waiting_srm_priority",
            "srm_priority_done",
            "done",
            name="user_status",
        ),
        nullable=False,
        default="mining",
    )
