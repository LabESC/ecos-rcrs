from database.db import conn as Session
from typing import List
from datetime import datetime
from model.Environment import Environment as EnvironmentModel

from model.VotingUserEnvironment import (
    VotingUserEnvironment as VotingUserEnvironmentModel,
)

basic_fields = [
    EnvironmentModel.id,
    EnvironmentModel.name,
    EnvironmentModel.details,
    EnvironmentModel.status,
]


# ! Definindo métodos do repositório do User
class Environment:
    # ! Obtendo todos os ambientes - TESTEre
    @staticmethod
    def get_all(db: Session) -> List[EnvironmentModel]:
        return db.query(EnvironmentModel).all()

    # ! Criando ambiente
    @staticmethod
    def create(
        db: Session, environment_add: EnvironmentModel  # , environment_id: str
    ) -> EnvironmentModel:
        db.add(environment_add)
        db.commit()
        db.refresh(environment_add)
        return environment_add

    # ! Obtendo ambiente por id
    @staticmethod
    def get_by_id(db: Session, id: str) -> EnvironmentModel:
        return db.query(EnvironmentModel).filter(EnvironmentModel.id == id).first()

    # ! Obtendo ambientes por id do usuário
    @staticmethod
    def get_by_user_id(db: Session, user_id: str) -> List[EnvironmentModel]:
        # ! Retornar colunas id, status, details e name, filtradas pelo user_id
        return db.query(*basic_fields).filter(EnvironmentModel.user_id == user_id).all()

    # ! Alterando status do ambiente
    @staticmethod
    def update_status(
        db: Session, environment_id: str, status: str
    ) -> EnvironmentModel:
        environment = (
            db.query(EnvironmentModel)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )
        environment.status = status
        environment.last_updated = datetime.now()

        db.commit()
        db.refresh(environment)
        return environment

    # ! Alterando dados de mineração
    @staticmethod
    def update_mining(
        db: Session, environment_id: str, mining_data: list[dict], status: str = None
    ) -> EnvironmentModel:
        environment = (
            db.query(EnvironmentModel)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )
        environment.mining_data = mining_data
        environment.last_updated = datetime.now()

        # * Se existir status, altere-o
        if status:
            environment.status = status

        db.commit()
        db.refresh(environment)
        return environment

    # ! Alterando dados de tópicos
    @staticmethod
    def update_topics(
        db: Session, environment_id: str, topic_data: list[dict], status: str = None
    ) -> EnvironmentModel:
        environment = (
            db.query(EnvironmentModel)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )
        environment.topic_data = topic_data
        environment.last_updated = datetime.now()

        # * Se existir status, altere-o
        if status:
            environment.status = status

        db.commit()
        db.refresh(environment)
        return environment

    # ! Alterando dados de prioridades
    @staticmethod
    def update_priority(
        db: Session, environment_id: str, priority_data: list[dict], status: str = None
    ) -> EnvironmentModel:
        environment = (
            db.query(EnvironmentModel)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )
        environment.priority_data = priority_data
        environment.last_updated = datetime.now()

        # * Se existir status, altere-o
        if status:
            environment.status = status

        db.commit()
        db.refresh(environment)
        return environment

    # ! Alterando dados de RCR final
    @staticmethod
    def update_final_rcr(
        db: Session, environment_id: str, final_rcr: list[dict], status: str = None
    ) -> EnvironmentModel:
        environment = (
            db.query(EnvironmentModel)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )
        environment.final_rcr = final_rcr
        environment.last_updated = datetime.now()

        # * Se existir status, altere-o
        if status:
            environment.status = status

        db.commit()
        db.refresh(environment)
        return environment

    # ! Obtendo usuários votantes de um ambiente
    @staticmethod
    def get_voting_users(
        db: Session, environment_id: str
    ) -> List[VotingUserEnvironmentModel]:
        return (
            db.query(VotingUserEnvironmentModel)
            .filter(VotingUserEnvironmentModel.environment_id == environment_id)
            .all()
        )
