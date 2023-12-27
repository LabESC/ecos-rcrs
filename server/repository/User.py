# from sqlalchemy.orm import Session
import uuid
from datetime import datetime
from database.db import conn as Session
from typing import List

from model.User import User as UserModel
from validations.User import User as UserValidation


# ! Definindo métodos do repositório do User
class User:
    # ! Obtendo todos os usuários
    @staticmethod
    def get_all(db: Session) -> List[UserModel]:
        return db.query(UserModel).all()

    # ! Criando usuário
    @staticmethod
    def create(
        db: Session, user: UserModel, user_id: str, password_hash: str
    ) -> UserModel:
        user_add = UserModel(
            id=user_id,
            name=user.name,
            email=user.email,
            password=password_hash,
            status="pending",
            token=None,
        )
        db.add(user_add)
        db.commit()
        db.refresh(user_add)
        return user_add

    # ! Obtendo usuário por id
    @staticmethod
    def get_by_id(db: Session, id: str) -> UserModel:
        return db.query(UserModel).filter(UserModel.id == id).first()

    # ! Verificando existencia de usuário por e-mail
    @staticmethod
    def exists_by_email(db: Session, email: str) -> bool:
        return db.query(UserModel).filter(UserModel.email == email).first() is not None

    # ! Atualizando usuário por id
    @staticmethod
    def update_by_id(
        db: Session, id: str, name: str = None, email: str = None, password: str = None
    ) -> UserModel:
        user_db = db.query(UserModel).filter(UserModel.id == id).first()
        if user_db is not None:
            user_db.name = name
            user_db.email = email
            user_db.last_updated = datetime.now()
            # * Se foi recebido senha, altere-a
            if password is not None:
                user_db.password = password
            db.commit()
            db.refresh(user_db)

        return user_db

    # ! Ativando usuário
    @staticmethod
    def activate(db: Session, id: str):
        user = db.query(UserModel).filter(UserModel.id == id).first()
        if user is None:
            return False

        if user.status == "active":
            return None

        user.status = "active"
        user.last_updated = datetime.now()
        db.commit()
        return True

    # ! Inativando usuário por id
    @staticmethod
    def inactivate(db: Session, id: str) -> bool:
        user = db.query(UserModel).filter(UserModel.id == id).first()
        if user is None:
            return False

        user.status = "inactive"
        user.last_updated = datetime.now()
        db.commit()
        return True

    # ! Autenticando usuário
    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> UserModel:
        user = db.query(UserModel).filter(UserModel.email == email).first()
        if user is None:
            return False

        if not UserValidation.validate_password(password, user.password):
            return None

        user.token = str(uuid.uuid4())
        db.commit()
        return user

    # ! Validando token
    @staticmethod
    def validate_token(db: Session, id: str, token: str) -> bool:
        user = db.query(UserModel).filter(UserModel.id == id).first()
        if user is None:  # * Se não existir usuário
            return False

        if user.token != token:  # * Se o token não for igual
            return False

        return True
