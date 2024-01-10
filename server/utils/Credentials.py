# ! Importando a senha e login salvos para autenticar o usuário do arquivo .env
import os
from dotenv import load_dotenv
from pathlib import Path


env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)


class Credentials:
    @staticmethod
    def get_service_login():
        return os.getenv("SERVICES_LOGIN")

    @staticmethod
    def get_service_pwd():
        return os.getenv("SERVICES_PWD")
