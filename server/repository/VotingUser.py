# from sqlalchemy.orm import Session
from sqlalchemy import and_
from database.db import conn as Session
from typing import List
from model.VotingUser import VotingUser as VotingUserModel
from model.VotingUserEnvironment import (
    VotingUserEnvironment as VotingUserEnvironmentModel,
)
from validations.User import User as UserValidation


# ! Definindo métodos do repositório do User
class VotingUser:
    # ! Obtendo todos os usuários
    @staticmethod
    def get_all(db: Session) -> List[VotingUserModel]:
        return db.query(VotingUserModel).all()

    # ! Criando usuário
    @staticmethod
    def create(
        db: Session, voting_user: VotingUserModel, voting_user_id: str
    ) -> VotingUserModel:
        voting_user_add = VotingUserModel(id=voting_user_id, email=voting_user.email)
        db.add(voting_user_add)
        db.commit()
        db.refresh(voting_user_add)
        return voting_user_add

    # ! Obtendo usuário por id
    @staticmethod
    def get_by_email(db: Session, email: str) -> VotingUserModel:
        return db.query(VotingUserModel).filter(VotingUserModel.email == email).first()

    # ! Autenticando usuário
    @staticmethod
    def validate_access_code(
        db: Session, email: str, access_code: str
    ) -> VotingUserModel:
        voting_user = (
            db.query(VotingUserModel).filter(VotingUserModel.email == email).first()
        )
        if voting_user is None:
            return None

        if voting_user.access_code != access_code:
            return False

        return True

    # ! Validando token
    @staticmethod
    def generate_access_code(db: Session, email: str, access_code: str) -> bool:
        voting_user = (
            db.query(VotingUserModel).filter(VotingUserModel.email == email).first()
        )
        if voting_user is None:  # * Se não existir usuário
            return False

        voting_user.access_code = access_code
        db.commit()
        db.refresh(voting_user)

        return True

    # ! Registrando votos de definição de rcr
    @staticmethod
    def register_definition_votes(
        db: Session, voting_user_id: str, environment_id: str, votes: list[dict]
    ) -> bool:
        voting_user_environment = (
            db.query(VotingUserEnvironmentModel)
            .filter(
                and_(
                    VotingUserEnvironmentModel.id == voting_user_id,
                    VotingUserEnvironmentModel.environment_id == environment_id,
                )
            )
            .first()
        )
        if voting_user_environment is None:
            return False

        voting_user_environment.votes_rcr_definition = votes
        db.commit()
        db.refresh(voting_user_environment)

        return True

    # ! Registrando votos de priorização de rcr
    @staticmethod
    def register_priority_votes(
        db: Session, voting_user_id: str, environment_id: str, votes: list[dict]
    ) -> bool:
        voting_user_environment = (
            db.query(VotingUserEnvironmentModel)
            .filter(
                and_(
                    VotingUserEnvironmentModel.id == voting_user_id,
                    VotingUserEnvironmentModel.environment_id == environment_id,
                )
            )
            .first()
        )
        if voting_user_environment is None:
            return False

        voting_user_environment.votes_rcr_priority = votes
        db.commit()
        db.refresh(voting_user_environment)

        return True
