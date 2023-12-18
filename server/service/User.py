import uuid
import bcrypt
from repository.User import User as UserRepository
from validations.Email import Email as ValidationEmail

from database.db import conn
from schemas.User import UserRequest, UserResponse, AuthRequest, AuthResponse

from utils.EmailSender import send_email

class User:
    # ! Retorna todos os usuários
    async def get_all(self):
        try:
            db = next(conn())
            usuarios = UserRepository.get_all(db)
            return usuarios if usuarios else None
        except Exception as e:
            print(e)
            return -1

    # ! Retorna um usuário pelo e-mail
    async def get_by_id(self, id: str):
        try:
            db = next(conn())
            usuario = UserRepository.get_by_id(db, id)
            return usuario
        except Exception as e:
            print(e)
            return -1

    # ! Cria um usuário
    async def create(self, user: UserRequest) -> UserRequest:
        # * Validando se o e-mail está no formato no correto e existe
        if ValidationEmail.validate(user.email) in [False, None]:
            return -2

        # * Gerando uuid como id do user e hasheando a senha
        user_id = str(uuid.uuid4())
        password_hash = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())
        usuario = None

        # Inserindo usuário no BD
        try:
            db = next(conn())
            usuario = UserRepository.create(db, user, user_id, password_hash)
        except Exception as e:
            print(e)
            return -1

        if usuario is None:
            return None

        # * Enviando e-mail de confirmação
        try:
            send_email(user.email, "Confirmação de cadastro", "Confirme seu cadastro")
        except Exception as e:
            print(e)

        return usuario

    # ! Atualiza um usuário
    async def update(self, user: UserRequest, id: str):
        # * Validando se o e-mail está no formato no correto e existe
        if ValidationEmail.validate(user.email) in [False, None]:
            return -2

        # * Se foi recebido senha, hasheia ela
        if user.password:
            user.password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

        try:
            db = next(conn())
            usuario = UserRepository.update_by_id(db, id, user.name, user.email, user.password)
            return usuario if usuario else None
        except Exception as e:
            print(e)
            return -1


    # ! Autentica um usuário
    async def authenticate(self, user_auth_request: AuthRequest) -> AuthResponse:
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

    async def inactivate(self, id: str):
        try:
            db = next(conn())
            usuario = UserRepository.inactivate(db, id)
            return usuario if usuario else None
        except Exception as e:
            print(e)
            return -1

    async def activate(self, id: str):
        try:
            db = next(conn())
            usuario = UserRepository.activate(db, id)
            return usuario if usuario else None
        except Exception as e:
            print(e)
            return -1

    async def test_email_sender(self):
        try:
            email = send_email("edu.makermakers@gmail.com", "Teste", "Teste")
            return email
        except Exception as e:
            print(e)
            return -1
