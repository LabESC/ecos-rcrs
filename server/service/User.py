import uuid
import bcrypt
from repository.User import User as UserRepository
from validations.Email import Email as ValidationEmail

from database.db import conn
from schemas.User import UserRequest, AuthRequest, AuthResponse

from service.APIRequests import APIRequests
from utils.Credentials import Credentials

from utils.AccessCode import AccessCode as AccessCodeUtil


class User:
    # ! Retorna todos os usuários
    @staticmethod
    async def get_all():
        try:
            db = next(conn())
            users = UserRepository.get_all(db)
            return users if users else None
        except Exception as e:
            print(e)
            return -1

    # ! Retorna um usuário pelo e-mail
    @staticmethod
    async def get_by_id(id: str):
        try:
            db = next(conn())
            user = UserRepository.get_by_id(db, id)
            return user
        except Exception as e:
            print(e)
            return -1

    # ! Cria um usuário
    @staticmethod
    async def create(user: UserRequest) -> UserRequest:
        # * Validando se o e-mail já existe
        try:
            db = next(conn())
            if UserRepository.exists_by_email(db, user.email):
                return -3
        except Exception as e:
            print(e)
            return -1

        # * Validando se o e-mail está no formato no correto e existe
        if ValidationEmail.validate(user.email) in [False, None]:
            return -2

        # * Gerando uuid como id do user e hasheando a senha
        user_id = str(uuid.uuid4())
        password_hash = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())
        new_user = None

        # * Inserindo usuário no BD
        try:
            db = next(conn())
            new_user = UserRepository.create(db, user, user_id, password_hash)
        except Exception as e:
            print(e)
            return -1

        if new_user is None:
            return None

        # * Enviando e-mail de confirmação
        try:
            text = f"Olá {user.name}, seu cadastro foi criado com sucesso!\n"
            text += f"Nome: {user.name}\n"
            text += f"E-mail: {user.email}\n"
            text += f"Para confirmar seu cadastro, acesse o link: {Credentials.get_client_url_base}/activate?id={user_id}"

            await APIRequests.send_email(
                user.email, "ECOS_IC: Criação de cadastro", text
            )
        except Exception as e:
            print(e)

        return new_user

    # ! Atualiza um usuário
    @staticmethod
    async def update(user: UserRequest, id: str):
        # * Validando se o e-mail já existe
        try:
            db = next(conn())
            vrf_email = UserRepository.exists_by_email(db, user.email)

            if vrf_email and vrf_email != id:
                return -3

        except Exception as e:
            print(e)
            return -1

        # * Validando se o e-mail está no formato no correto e existe
        if ValidationEmail.validate(user.email) in [False, None]:
            return -2

        # * Se foi recebido senha, hasheia ela
        if user.password:
            user.password = bcrypt.hashpw(
                user.password.encode("utf-8"), bcrypt.gensalt()
            )

        # * Atualize os dados no BD
        try:
            user_updated = UserRepository.update_by_id(
                db, id, user.name, user.email, user.password
            )
        except Exception as e:
            print(e)
            return -1

        # * Envie e-mail sobre alterações
        try:
            text = f"Olá {user.name}, seus dados foram atualizados com sucesso!\n"
            text += f"Nome: {user.name}\n"
            text += f"E-mail: {user.email}"

            await APIRequests.send_email(
                user.email, "ECOS_IC: Atualização de dados", text
            )
        except Exception as e:
            print(e)

        return user_updated

    # ! Autentica um usuário
    @staticmethod
    async def authenticate(user_auth_request: AuthRequest) -> AuthResponse:
        try:
            db = next(conn())
            user_auth_request = UserRepository.authenticate(
                db, user_auth_request.email, user_auth_request.password
            )
            return (
                AuthResponse(id=user_auth_request.id, token=user_auth_request.token)
                if user_auth_request
                else user_auth_request
            )
        except Exception as e:
            print(e)
            return -1

    # ! Inativa um usuário
    @staticmethod
    async def inactivate(id: str):
        try:
            db = next(conn())
            user = UserRepository.inactivate(db, id)
            return user if user else None
        except Exception as e:
            print(e)
            return -1

    # ! Ativa um usuário
    @staticmethod
    async def activate(id: str):
        try:
            db = next(conn())
            user = UserRepository.activate(db, id)
            return user if user else None
        except Exception as e:
            print(e)
            return -1

    # ! Valida o token de um usuário
    @staticmethod
    async def validate_token(id: str, token: str):
        try:
            db = next(conn())
            user = UserRepository.validate_token(db, id, token)
            return user
        except Exception as e:
            print(e)
            return -1

    # ! Retorna um token para uma solicitação de senha perdida
    @staticmethod
    async def get_token_for_password(email: str):
        access_code = AccessCodeUtil.generate()
        try:
            db = next(conn())
            user = UserRepository.set_token_for_password(db, email, access_code)
        except Exception as e:
            print(e)
            return -1

        if user in [False, None]:
            return False

        # * Enviando e-mail com o token
        try:
            text = f"{user.name}, here's the token for your password reset:\n"
            text += f"<h4> <strong> {user.token} </strong> </h4>\n"

            await APIRequests.send_email(user.email, "SECO_RCR: Token", text)
        except Exception as e:
            print(e)
            return -1

        return True

    # ! Valida o token de recuperação de senha um usuário
    @staticmethod
    async def validate_token_by_email(email: str, token: str):
        try:
            db = next(conn())
            user = UserRepository.validate_token_by_email(db, email, token)
            return user
        except Exception as e:
            print(e)
            return -1

    # ! Altera a senha de um usuário
    @staticmethod
    async def update_password(email: str, password: str, token: str):
        try:
            db = next(conn())
            # . Validando token
            print(email + " - " + token)
            is_token_valid = UserRepository.validate_token_by_email(db, email, token)
            if not is_token_valid:
                return False

            # . Hasheando senha
            new_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

            # . Se valido, alterar senha
            user = UserRepository.update_password(db, email, new_password)
            return user if user else None
        except Exception as e:
            print(e)
            return -1
