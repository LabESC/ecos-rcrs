# ! Importando a senha e login salvos para autenticar o usuário do arquivo .env
import os
from dotenv import load_dotenv
from pathlib import Path


env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)


class Credentials:
    @staticmethod
    def get_user():
        return os.getenv("USER_LOGIN")

    @staticmethod
    def get_user_pwd():
        return os.getenv("USER_PWD")

    @staticmethod
    def get_github_token():
        return os.getenv("GITHUB_TOKEN")

    @staticmethod
    def get_db_microsservice_base():
        return os.getenv("DB_MICROSERVICE_BASE")

    @staticmethod
    def get_topic_microsservice_base():
        return os.getenv("TOPIC_MICROSERVICE_BASE")
