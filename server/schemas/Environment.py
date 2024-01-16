from pydantic import BaseModel
from typing import Optional, Union


"""class EnvironmentDataBase(BaseModel):
    repos: list[str]
    mining_type: str
    organization_name: Optional[str] = None
    mining_data: Optional[list[dict]] = None
    topic_data: Optional[list[dict]] = None
    priority_data: Optional[list[dict]] = None
    final_rcr: Optional[list[dict]] = None
"""


class EnvironmentBase(BaseModel):
    user_id: str
    name: str
    details: str
    repos: list[str]
    mining_type: str
    organization_name: Optional[str] = None
    mining_data: Optional[list[dict]] = None
    topic_data: Optional[list[dict]] = None
    priority_data: Optional[list[dict]] = None
    final_rcr: Optional[list[dict]] = None


class EnvironmentRequest(EnvironmentBase):
    ...


class EnvironmentResponse(BaseModel):
    id: str
    user_id: str
    name: str
    details: str
    mining_type: str
    organization_name: Optional[str] = None
    status: str

    class Config:
        from_attributes = True


class EnvironmentResponseFiltered(BaseModel):
    id: str
    name: str
    details: str
    status: str


class DataError(BaseModel):
    error: dict


class MiningData(BaseModel):
    issues: list[dict]
    errors: dict


class EnvironmentUpdateMiningDataRequest(BaseModel):
    mining_data: Union[MiningData, DataError]
    status: str


# !! Avaliar este objeto  - ERRO
class TopicData(BaseModel):
    comparisons: list[dict]
    topics: list[list[str]]


class EnvironmentUpdateTopicDataRequest(BaseModel):
    topic_data: Union[TopicData, DataError]
    status: str


class EnvironmentUpdatePriorityDataRequest(BaseModel):
    priority_data: Optional[list[dict]] = None
    status: Optional[str] = None


class EnvironmentUpdateFinalDataRequest(BaseModel):
    final_rcr: Optional[list[dict]] = None
    status: Optional[str] = None


class EnvironmentVotingUsers(BaseModel):
    voting_users: list[str]
