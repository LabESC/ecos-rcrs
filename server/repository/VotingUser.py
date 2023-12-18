# from sqlalchemy.orm import Session
from database.db import conn as Session
from typing import List
from model.User import VotingUser as VotingUserModel
from validations.User import User as UserValidation
from utils.AccessCode import AccessCode as AccessCodeUtil


# ! Definindo métodos do repositório do User
class VotingUser:
    # ! Obtendo todos os usuários
    @staticmethod
    def get_all(db: Session) -> List[VotingUserModel]:
        return db.query(VotingUserModel).all()

    # ! Criando usuário
    @staticmethod
    def create(
        db: Session, user: VotingUserModel, voting_user_id: str
    ) -> VotingUserModel:
        voting_user_add = VotingUserModel(id=voting_user_id, email=user.email)
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
        user = db.query(VotingUserModel).filter(VotingUserModel.email == email).first()
        if user is None:
            return False

        if user.access_code != access_code:
            return False

        return True

    # ! Validando token
    @staticmethod
    def generate_access_code(db: Session, email: str) -> bool:
        user = db.query(VotingUserModel).filter(VotingUserModel.id == id).first()
        if user is None:  # * Se não existir usuário
            return False

        user.access_code = AccessCodeUtil.generate()

        return True
