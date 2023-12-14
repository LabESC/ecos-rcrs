# from sqlalchemy.orm import Session
from database.db import conn as Session
from typing import List
from model.User import User as UserModel


# ! Definindo métodos do repositório do User
class User:
    # ! Obtendo todos os usuários
    @staticmethod
    def get_all(db: Session) -> List[UserModel]:
        return db.query(UserModel).all()

    # ! Criando usuário
    @staticmethod
    def create(db: Session, user: UserModel, user_id: str) -> UserModel:
        user_add = UserModel(
            id=user_id,
            name=user.name,
            email=user.email,
            password=user.password,
            status="pending",
        )
        db.add(user_add)
        db.commit()
        db.refresh(user_add)
        return user_add
        # return User.get_by_id(db, user_id)

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
            user_db.password = password
            db.commit()
        return user_db

    # ! Inativando usuário por id
    @staticmethod
    def inactivate_by_id(db: Session, id: str) -> None:
        user = db.query(UserModel).filter(UserModel.id == id).first()
        if user is not None:
            user.active = False
            db.commit()
