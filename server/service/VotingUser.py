import uuid
import bcrypt
from repository.VotingUser import VotingUser as VotingUserRepository
from validations.Email import Email as ValidationEmail

from database.db import conn
from schemas.VotingUser import VotingUserBase, VotingUserRequest

from utils.EmailSender import send_email
from utils.AccessCode import AccessCode as AccessCodeUtil


class VotingUser:
    # ! Retorna um usuário pelo e-mail
    async def get_by_email(self, email: str):
        try:
            db = next(conn())
            usuario = VotingUserRepository.get_by_email(db, email)
            return usuario
        except Exception as e:
            print(e)
            return -1

    # ! Cria um usuário votante
    async def create(self, voting_user: VotingUserRequest) -> VotingUserRequest:
        # * Validando se o e-mail está no formato no correto e existe
        if ValidationEmail.validate(voting_user.email) in [False, None]:
            return -2

        # * Gerando uuid como id do user e hasheando a senha
        voting_user_id = str(uuid.uuid4())
        usuario = None

        # Inserindo usuário no BD
        try:
            db = next(conn())
            usuario = VotingUserRepository.create(db, voting_user, voting_user_id)
        except Exception as e:
            print(e)
            return -1

        if usuario is None:
            return None

        # * Enviando e-mail de confirmação
        try:
            send_email(
                voting_user.email, "Confirmação de cadastro", "Confirme seu cadastro"
            )
        except Exception as e:
            print(e)

        return usuario

    # ! Gera um código de acesso para o usuário votante
    async def generate_access_code(self, email: str):
        # * Gerando código de acesso
        access_code = AccessCodeUtil.generate()
        try:
            db = next(conn())
            usuario = VotingUserRepository.generate_access_code(db, email, access_code)
        except Exception as e:
            print(e)
            return -1

        if not usuario:
            return False

        # * Enviando e-mail de confirmação
        try:
            send_email(
                email,
                "ECOS IC - Código de acesso",
                f"Seu código de acesso é: {access_code}",
            )
        except Exception as e:
            print(e)
            return -2

        return True

    # ! Valida o código de acesso para o usuário votante
    async def validate_access_code(self, email: str, access_code: str):
        try:
            db = next(conn())
            usuario = VotingUserRepository.validate_access_code(db, email, access_code)
        except Exception as e:
            print(e)
            return -1

        return usuario

    # ! Registrando os votos de definição do usuário votante
    async def register_definition_votes(
        self, voting_user_id: str, environment_id: str, votes: list[dict]
    ):
        try:
            db = next(conn())
            vote = VotingUserRepository.register_definition_votes(
                db, voting_user_id, environment_id, votes
            )
        except Exception as e:
            print(e)
            return -1

        return vote

    # ! Registrando os votos de priorização do usuário votante
    async def register_priority_votes(
        self, voting_user_id: str, environment_id: str, votes: list[dict]
    ):
        try:
            db = next(conn())
            vote = VotingUserRepository.register_priority_votes(
                db, voting_user_id, environment_id, votes
            )
        except Exception as e:
            print(e)
            return -1

        return vote
