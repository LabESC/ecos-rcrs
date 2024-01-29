import uuid
from repository.Environment import Environment as EnvironmentRepository
from model.Environment import Environment as EnvironmentModel

from database.db import conn
from schemas.Environment import EnvironmentRequest
from service.APIRequests import APIRequests
from utils.Environment import Environment as EnvironmentUtils

# ! Outras dependencias
from repository.User import User as UserRepository


class Environment:
    # ! Retorna todos os ambientes
    @staticmethod
    async def get_all():
        try:
            db = next(conn())
            environments = EnvironmentRepository.get_all(db)
            return environments
        except Exception as e:
            print(e)
            return -1

    # ! Retorna um ambiente
    @staticmethod
    async def get_by_id(id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_by_id(db, id)
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Retorna os ambientes a partir do id do usuário
    @staticmethod
    async def get_by_user_id(user_id: str):
        try:
            db = next(conn())
            environments = EnvironmentRepository.get_by_user_id(db, user_id)
            print(environments)
            return environments
        except Exception as e:
            print(e)
            return -1

    # ! Cria um ambiente
    @staticmethod
    async def create(environment: EnvironmentRequest) -> EnvironmentRequest:
        try:
            db = next(conn())
        except Exception as e:
            print(e)
            return -1

        # !! Validando se o usuário está ativo...
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

        # * Inserindo ambiente no BD
        try:
            ambiente = EnvironmentRepository.create(db, ambiente_add)
        except Exception as e:
            print(e)
            return -1

        if ambiente is None:
            return None

        # * Enviando e-mail informando da mineração
        try:
            subject = f"ECOS_IC: Criação do ambiente {ambiente.name}"
            text = f"Olá, {user.name}! Sseu ambiente foi criado com sucesso e a mineração logo será iniciada!\n"
            text += f"<strong>Nome do ambiente</strong>: {ambiente.name}\n"
            text += f"<strong>Tipo de mineração</strong>: {ambiente.mining_type}\n"
            text += f"<strong>Repositórios</strong>: {ambiente.repos}\n"
            text += (
                f"<strong>Organização</strong>: {ambiente.organization_name}\n"
                if ambiente.mining_type == "organization"
                else ""
            )
            text += f"<strong>Detalhes</strong>: {ambiente.details}\n"

            await APIRequests.send_email(user.email, subject, text)
        except Exception as e:
            print(e)

        return ambiente

    # ! Altera o status do ambiente
    @staticmethod
    async def update_status(environment_id: str, status: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.update_status(
                db,
                environment_id,
                status,
            )
            return environment
        except Exception as e:
            print(e)
            return -1

    # ! Altera os dados de mineração
    @staticmethod
    async def update_mining(
        environment_id: str, mining_data: dict, status: str = "mining_done"
    ):
        try:
            db = next(conn())
            EnvironmentRepository.update_mining(db, environment_id, mining_data, status)
        except Exception as e:
            print(e)
            return -1

        # * Enviando e-mail informando da mineração
        try:
            user_environment = (
                EnvironmentRepository.get_created_user_email_by_environment_id(
                    db, environment_id
                )
            )

            subject = f"ECOS_IC: Mineração do ambiente {user_environment[1]}"
            text = f"Olá, a mineração do seu ambiente {user_environment[1]} foi concluída!\n"
            text += f"É necessário que você acesse o sistema para solicitar a geração de tópicos do ambiente.\n"

            await APIRequests.send_email(user_environment[0], subject, text)
        except Exception as e:
            print(e)

        return True

    # ! Altera os dados de tópicos
    @staticmethod
    async def update_topics(
        environment_id: str, topic_data: list[dict], status: str = "topics_done"
    ):
        try:
            db = next(conn())
            EnvironmentRepository.update_topics(db, environment_id, topic_data, status)
        except Exception as e:
            print(e)
            return -1

        # * Enviando e-mail informando da geração de tópicos
        try:
            user_environment = (
                EnvironmentRepository.get_created_user_email_by_environment_id(
                    db, environment_id
                )
            )

            subject = f"ECOS_IC: Tópicos do ambiente {user_environment[1]}"
            text = f"Olá, a geração de tópicos do seu ambiente {user_environment[1]} foi concluída!\n"
            text += f"Você já pode visualizar os tópicos e as issues associadas no sistema.\n"

            await APIRequests.send_email(user_environment[0], subject, text)
        except Exception as e:
            print(e)

        return True

    # ! Altera os dados de prioridades
    @staticmethod
    async def update_priority(
        environment_id: str,
        priority_data: list[dict],
        status: str = "rcr_priority_done",
    ):
        try:
            db = next(conn())
            EnvironmentRepository.update_priority(
                db, environment_id, priority_data, status
            )
        except Exception as e:
            print(e)
            return -1

        return True

    # ! Altera os dados de prioridades
    @staticmethod
    async def update_final_rcr(
        environment_id: str, final_rcr: list[dict], status: str = None
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
    @staticmethod
    async def get_mining_data(environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_mining_data(db, environment_id)
            if environment is None or environment is False:
                return environment

            return environment[0]
        except Exception as e:
            print(e)
            return -1

    # ! Obtem os dados de tópicos
    @staticmethod
    async def get_topic_data(environment_id: str):
        try:
            db = next(conn())
            topic_data = EnvironmentRepository.get_topic_data(db, environment_id)
            if topic_data in [False, None]:
                return topic_data

            topic_data = topic_data[0]

            return topic_data
            """mining_data = EnvironmentRepository.get_mining_data(db, environment_id)

            if mining_data in [False, None]:
                return mining_data

            mining_data = mining_data[0]

            # Juntando os dados de comparacoes agrupados por topicos
            return EnvironmentUtils.join_comparisons_and_topics(topic_data, mining_data)"""
        except Exception as e:
            print(e)
            return -1

    # ! Obtem os dados de prioridades
    @staticmethod
    async def get_priority_data(environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_priority_data(db, environment_id)
            if environment is None or environment is False:
                return environment

            return environment[0]
        except Exception as e:
            print(e)
            return -1

    # ! Obtem os dados de RCR final
    @staticmethod
    async def get_final_rcr(environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_final_rcr(db, environment_id)
            if environment is None or environment is False:
                return environment

            return environment[0]
        except Exception as e:
            print(e)
            return -1

    # ! Obtendo usuários votantes de um ambiente
    @staticmethod
    async def get_voting_users(environment_id: str):
        try:
            db = next(conn())
            users = EnvironmentRepository.get_voting_users(db, environment_id)
        except Exception as e:
            print(e)
            return -1

        # * Se retornar mais de um usuário, retorne todos
        try:
            users = [user[0] for user in users]
        except Exception as e:
            print(e)

        return users

    # ! Verificando se há dados de mineração
    @staticmethod
    async def has_mining_data(environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_mining_data(db, environment_id)
            if environment is None or environment is False:
                return environment

            if environment[0] is None:
                return False

            return True
        except Exception as e:
            print(e)
            return False

    # ! Verificando se há dados de topicos
    @staticmethod
    async def has_topic_data(environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_topic_data(db, environment_id)
            if environment is None or environment is False:
                return environment

            if environment[0] is None:
                return False

            return True
        except Exception as e:
            print(e)
            return False

    # ! Verificando se há dados de prioridades
    @staticmethod
    async def has_priority_data(environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_priority_data(db, environment_id)
            print(environment)
            if environment is None or environment is False:
                return environment

            if environment[0] is None:
                return False

            return True
        except Exception as e:
            print(e)
            return False

    # ! Verificando se há dados de RCR final
    @staticmethod
    async def has_final_rcr(environment_id: str):
        try:
            db = next(conn())
            environment = EnvironmentRepository.get_final_rcr(db, environment_id)
            if environment is None or environment is False:
                return environment

            if environment[0] is None:
                return False

            return True
        except Exception as e:
            print(e)
            return False
