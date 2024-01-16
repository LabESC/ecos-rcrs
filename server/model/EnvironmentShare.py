from sqlalchemy import BigInteger, Column, String, ForeignKey

from database.db import Base
from sqlalchemy.dialects.postgresql import ENUM


# ! Classe associativa para relacionar outros usuários a um ambiente
class VotingUserEnvironment(Base):
    __tablename__ = "users_environments"
    __table_args__ = {"schema": "ic"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id: str = Column(String(45), ForeignKey("ic.users.id"), nullable=False)
    environment_id: str = Column(
        String(45), ForeignKey("ic.environments.id"), nullable=False
    )
    role: str = Column(ENUM("owner", "read", name="mining_type"), nullable=False)
