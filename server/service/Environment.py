import uuid
from repository.Environment import Environment as EnvironmentRepository
from model.Environment import Environment as EnvironmentModel
from validations.Email import Email as ValidationEmail

from database.db import conn
from schemas.Environment import EnvironmentRequest

from utils.EmailSender import send_email

# ! Outras dependencias
from repository.User import User as UserRepository


class Environment:
    @staticmethod
    # ! Retorna todos os ambientes
    async def get_all():
        try:
            db = next(conn())
            environments = EnvironmentRepository.get_all(db)
            return environments
        except Exception as e:
            print(e)
            return -1

    # ! Retorna um ambiente
    async def get_by_id(self, id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_by_id(db, id)
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Retorna os ambientes a partir do id do usuário
    async def get_by_user_id(self, user_id: str):
        try:
            db = next(conn())
            environments = EnvironmentRepository.get_by_user_id(db, user_id)
            print(environments)
            return environments
        except Exception as e:
            print(e)
            return -1

    # ! Cria um ambiente
    async def create(self, environment: EnvironmentRequest) -> EnvironmentRequest:
        try:
            db = next(conn())
        except Exception as e:
            print(e)
            return -1

        # !! Validando se o usuário está ativo... (pendente)
        user = UserRepository.get_by_id(db, environment.user_id)
        if user is None:
            return -2

        if user.status != "active":
            return -3

        # ! Validando se o tipo é organização e o nome da organização foi informado
        if (
            environment.data.mining_type == "organization"
            and environment.data.organization_name is None
        ):
            return -4

        # * Gerando uuid como id do environment
        ambiente_add = EnvironmentModel(
            id=str(uuid.uuid4()), **environment.model_dump()
        )
        # voting_user_id = str(uuid.uuid4())
        ambiente = None

        # Inserindo usuário no BD
        try:
            ambiente = EnvironmentRepository.create(db, ambiente_add)
        except Exception as e:
            print(e)
            return -1

        if ambiente is None:
            return None
        """
        # * Enviando e-mail de confirmação
        try:
            send_email(
                environment.email, "Confirmação de cadastro", "Confirme seu cadastro"
            )
        except Exception as e:
            print(e)"""

        return ambiente
