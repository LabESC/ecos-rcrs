from sqlalchemy import Column, String, LargeBinary  # , Enum
from sqlalchemy.dialects.postgresql import ENUM
from database.db import Base


# ! Definindo modelo da entidade VotingUsers
class VotingUser(Base):
    __tablename__ = "voting_users"
    __table_args__ = {"schema": "ic"}

    id: str = Column(String(45), primary_key=True, index=True)
    email: str = Column(String(255), nullable=False, unique=True)
    access_code: str = Column(String(8))
