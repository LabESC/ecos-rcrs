from sqlalchemy import BigInteger, Column, String, ForeignKey

from database.db import Base
from sqlalchemy.dialects.postgresql import JSONB


# ! Classe associativa (relacionamentos)
class VotingUserEnvironment(Base):
    __tablename__ = "voting_users_environments"
    __table_args__ = {"schema": "ic"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    voting_user_id: str = Column(
        String(45), ForeignKey("ic.voting_users.id"), nullable=False
    )
    environment_id: str = Column(
        String(45), ForeignKey("ic.environments.id"), nullable=False
    )
    votes_rcr_definition: dict = Column(JSONB)
    votes_rcr_priority: dict = Column(JSONB)
