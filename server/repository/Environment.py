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
    # ! Obtendo todos os ambientes - TESTE
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
