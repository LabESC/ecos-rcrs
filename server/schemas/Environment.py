from pydantic import BaseModel
from typing import Optional, Union
from datetime import datetime


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


class EnvironmentRequest(EnvironmentBase): ...


class EnvironmentResponse(BaseModel):
    id: str
    user_id: str
    name: str
    details: str
    mining_type: str
    organization_name: Optional[str] = None
    repos: list[str]
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


class TopicSuccessData(BaseModel):
    comparisons: list[dict]


# !! Avaliar este objeto  - ERRO
class TopicData(BaseModel):
    comparisons: Union[TopicSuccessData, DataError]
    topics: list[list[str]]


class EnvironmentUpdateTopicDataRequest(BaseModel):
    topic_data: Union[list[dict], DataError]  # Union[TopicData, DataError]
    status: str


class EnvironmentUpdatePriorityDataRequest(BaseModel):
    priority_data: dict


class EnvironmentUpdatePriorityDataStatusRequest(BaseModel):
    closing_date: Optional[datetime] = None
    status: str


class EnvironmentUpdateFinalDataRequest(BaseModel):
    final_rcr: Optional[list[dict]] = None
    status: Optional[str] = None


class EnvironmentVotingUsers(BaseModel):
    voting_users: list[str]
