# ! Importando a senha e login salvos para autenticar o usuário do arquivo .env
import os
from dotenv import load_dotenv
from pathlib import Path


env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)


class Credentials:
    @staticmethod
    def get_service_login() -> str:
        return os.getenv("SERVICES_LOGIN")

    @staticmethod
    def get_service_pwd() -> str:
        return os.getenv("SERVICES_PWD")

    @staticmethod
    def get_api_microsservice_base() -> str:
        return os.getenv("API_MICROSERVICE_BASE")

    @staticmethod
    def get_topic_microsservice_base() -> str:
        return os.getenv("TOPIC_MICROSERVICE_BASE")

    @staticmethod
    def get_client_url_base() -> str:
        return os.getenv("CLIENT_URL_BASE")
