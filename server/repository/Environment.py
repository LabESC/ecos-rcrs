from database.db import conn as Session, engine as Engine
from typing import List
from datetime import datetime
from model.Environment import Environment as EnvironmentModel

from sqlalchemy import update
from model.VotingUserEnvironment import (
    VotingUserEnvironment as VotingUserEnvironmentModel,
)
from model.User import User as UserModel
from model.VotingUser import VotingUser as VotingUserModel

basic_fields = [
    EnvironmentModel.id,
    EnvironmentModel.user_id,
    EnvironmentModel.name,
    EnvironmentModel.details,
    EnvironmentModel.mining_type,
    EnvironmentModel.organization_name,
    EnvironmentModel.status,
    EnvironmentModel.repos,
]


# ! Definindo métodos do repositório do User
class Environment:
    # ! Obtendo todos os ambientes - TESTEre
    @staticmethod
    def get_all(db: Session) -> List[EnvironmentModel]:
        return db.query(*basic_fields).all()

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
        return db.query(*basic_fields).filter(EnvironmentModel.id == id).first()

    # ! Obtendo ambientes por id do usuário
    @staticmethod
    def get_by_user_id(db: Session, user_id: str) -> List[EnvironmentModel]:
        # ! Retornar colunas id, status, details e name, filtradas pelo user_id
        return db.query(*basic_fields).filter(EnvironmentModel.user_id == user_id).all()

    # ! Alterando status do ambiente
    @staticmethod
    def update_status(
        db: Session,
        environment_id: str,
        status: str,
    ) -> EnvironmentModel:
        db.query(EnvironmentModel).filter(EnvironmentModel.id == environment_id).update(
            {
                EnvironmentModel.status: status,
                EnvironmentModel.last_updated: datetime.now(),
            }
        )
        db.commit()
        return True

    # ! Alterando dados de mineração
    @staticmethod
    def update_mining(
        db: Session, environment_id: str, mining_data: list[dict], status: str
    ) -> EnvironmentModel:
        db.query(EnvironmentModel).filter(EnvironmentModel.id == environment_id).update(
            {
                EnvironmentModel.mining_data: mining_data,
                EnvironmentModel.last_updated: datetime.now(),
                EnvironmentModel.status: status,
            }
        )
        db.commit()
        return True

    # ! Alterando dados de tópicos
    @staticmethod
    def update_topics(
        db: Session, environment_id: str, topic_data: list[dict], status: str
    ) -> EnvironmentModel:
        db.query(EnvironmentModel).filter(EnvironmentModel.id == environment_id).update(
            {
                EnvironmentModel.topic_data: topic_data,
                EnvironmentModel.last_updated: datetime.now(),
                EnvironmentModel.status: status,
            }
        )
        db.commit()
        return True

    # ! Alterando dados de prioridades
    @staticmethod
    def update_priority(
        db: Session,
        environment_id: str,
        priority_data: list[dict],
        status: str = None,
    ) -> EnvironmentModel:
        if status is None:
            db.query(EnvironmentModel).filter(
                EnvironmentModel.id == environment_id
            ).update(
                {
                    EnvironmentModel.priority_data: priority_data,
                    EnvironmentModel.last_updated: datetime.now(),
                }
            )

        else:
            db.query(EnvironmentModel).filter(
                EnvironmentModel.id == environment_id
            ).update(
                {
                    EnvironmentModel.priority_data: priority_data,
                    EnvironmentModel.last_updated: datetime.now(),
                    EnvironmentModel.status: status,
                }
            )

        db.commit()
        return True

    # ! Alterando dados de RCR final
    @staticmethod
    def update_final_rcr(
        db: Session, environment_id: str, final_rcr: list[dict], status: str = None
    ) -> EnvironmentModel:
        db.query(EnvironmentModel).filter(EnvironmentModel.id == environment_id).update(
            {
                EnvironmentModel.final_rcr: final_rcr,
                EnvironmentModel.last_updated: datetime.now(),
                EnvironmentModel.status: status,
            }
        )
        db.commit()
        return True

    # ! Obtendo dados de mineração de um ambiente
    @staticmethod
    def get_mining_data(
        db: Session, environment_id: str
    ) -> EnvironmentModel.mining_data:
        return (
            db.query(EnvironmentModel.mining_data)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )

    # ! Obtendo dados de tópicos de um ambiente
    @staticmethod
    def get_topic_data(db: Session, environment_id: str) -> EnvironmentModel:
        return (
            db.query(EnvironmentModel.topic_data)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )

    # ! Obtendo dados de prioridades de um ambiente
    @staticmethod
    def get_priority_data(db: Session, environment_id: str) -> EnvironmentModel:
        return (
            db.query(EnvironmentModel.priority_data)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )

    # ! Obtendo dados de RCR final de um ambiente
    @staticmethod
    def get_final_rcr(db: Session, environment_id: str) -> EnvironmentModel:
        return (
            db.query(EnvironmentModel.final_rcr)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )

    # ! Obtendo usuários votantes de um ambiente
    @staticmethod
    def get_voting_users(db: Session, environment_id: str):
        return (
            db.query(
                VotingUserModel.email,
            )
            .join(
                VotingUserEnvironmentModel,
                VotingUserModel.id == VotingUserEnvironmentModel.voting_user_id,
            )
            .filter(VotingUserEnvironmentModel.environment_id == environment_id)
            .all()
        )

    @staticmethod
    def get_created_user_email_by_environment_id(db: Session, environment_id: str):
        return (
            db.query(UserModel.email, EnvironmentModel.name)
            .join(
                EnvironmentModel,
                EnvironmentModel.user_id == UserModel.id,
            )
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )

    # ! Obtendo repos de um ambiente
    @staticmethod
    def get_repos(db: Session, environment_id: str):
        return (
            db.query(EnvironmentModel.repos)
            .filter(EnvironmentModel.id == environment_id)
            .first()
        )
