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
            environment.mining_type == "organization"
            and environment.organization_name is None
        ):
            return -4

        # * Gerando uuid como id do environment
        ambiente_add = EnvironmentModel(
            id=str(uuid.uuid4()), **environment.model_dump()
        )
        ambiente = None

        # Inserindo ambiente no BD
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

    # ! Altera o status do ambiente
    async def update_status(self, environment_id: str, status: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.update_status(
                db, environment_id, status
            )
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Altera os dados de mineração
    async def update_mining(
        self, environment_id: str, mining_data: dict, status: str = "mining_done"
    ):
        try:
            db = next(conn())
            EnvironmentRepository.update_mining(db, environment_id, mining_data, status)
            return True
        except Exception as e:
            print(e)
            return -1

    # ! Altera os dados de tópicos
    async def update_topics(
        self, environment_id: str, topic_data: list[dict], status: str = "topics_done"
    ):
        try:
            db = next(conn())
            environment = EnvironmentRepository.update_topics(
                db, environment_id, topic_data, status
            )
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Altera os dados de prioridades
    async def update_priority(
        self,
        environment_id: str,
        priority_data: list[dict],
        status: str = "rcr_priority_done",
    ):
        try:
            db = next(conn())
            environment = EnvironmentRepository.update_priority(
                db, environment_id, priority_data, status
            )
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Altera os dados de prioridades
    async def update_final_rcr(
        self, environment_id: str, final_rcr: list[dict], status: str = None
    ):
        try:
            db = next(conn())
            environment = EnvironmentRepository.update_final_rcr(
                db, environment_id, final_rcr, status
            )
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Obtem os dados de mineração
    async def get_mining_data(self, environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_mining_data(db, environment_id)
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Obtem os dados de tópicos
    async def get_topic_data(self, environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_topic_data(db, environment_id)
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Obtem os dados de prioridades
    async def get_priority_data(self, environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_priority_data(db, environment_id)
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Obtem os dados de RCR final
    async def get_final_rcr(self, environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_final_rcr(db, environment_id)
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Obtendo usuários votantes de um ambiente
    async def get_voting_users(self, environment_id: str):
        try:
            db = next(conn())
            users = EnvironmentRepository.get_voting_users(db, environment_id)
            return users
        except Exception as e:
            print(e)
            return -1
