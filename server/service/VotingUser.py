import uuid
import bcrypt
from repository.VotingUser import VotingUser as VotingUserRepository
from validations.Email import Email as ValidationEmail

from database.db import conn
from schemas.VotingUser import VotingUserBase, VotingUserRequest
from service.APIRequests import APIRequests

from utils.AccessCode import AccessCode as AccessCodeUtil


class VotingUser:
    # ! Retorna um usuário pelo e-mail
    @staticmethod
    async def get_by_email(email: str):
        try:
            db = next(conn())
            voting_user = VotingUserRepository.get_by_email(db, email)
            return voting_user
        except Exception as e:
            print(e)
            return -1

    # ! Cria um usuário votante
    @staticmethod
    async def create(voting_user: VotingUserRequest) -> VotingUserRequest:
        # * Validando se o e-mail já existe
        try:
            db = next(conn())
            voting_user_search = VotingUserRepository.get_by_email(
                db, voting_user.email
            )
            if voting_user_search is not None:
                return voting_user_search
        except Exception as e:
            print(e)
            return -1

        # * Validando se o e-mail está no formato no correto e existe
        if ValidationEmail.validate(voting_user.email) in [False, None]:
            return -2

        # * Gerando uuid como id do user e hasheando a senha
        voting_user_id = str(uuid.uuid4())
        new_voter = None

        # * Inserindo usuário no BD
        try:
            db = next(conn())
            new_voter = VotingUserRepository.create(db, voting_user, voting_user_id)
        except Exception as e:
            print(e)
            return -1

        if new_voter is None:
            return None

        return new_voter

    # ! Gera um código de acesso para o usuário votante
    @staticmethod
    async def generate_access_code(email: str):
        # * Gerando código de acesso
        access_code = AccessCodeUtil.generate()
        try:
            db = next(conn())
            voter = VotingUserRepository.generate_access_code(db, email, access_code)
        except Exception as e:
            print(e)
            return -1

        if not voter:
            return False

        # * Envie e-mail sobre a geração do codigo
        try:
            text = f"Olá, seu código de acesso para confirmar o voto é:\n <strong> {access_code} </strong>"

            await APIRequests.send_email(email, "ECOS_IC: Código de acesso", text)
        except Exception as e:
            return -2

        return True

    # ! Valida o código de acesso para o usuário votante
    @staticmethod
    async def validate_access_code(field_value: str, access_code: str, field="email"):
        if field == "email":
            try:
                db = next(conn())
                is_code_valid = VotingUserRepository.validate_access_code_by_email(
                    db, field_value, access_code
                )
            except Exception as e:
                print(e)
                return -1
        else:
            try:
                db = next(conn())
                is_code_valid = VotingUserRepository.validate_access_code_by_id(
                    db, field_value, access_code
                )
            except Exception as e:
                print(e)
                return -1

        return is_code_valid

    # ! Registrando os votos de definição do usuário votante
    @staticmethod
    async def register_definition_votes(
        voting_user_id: str, environment_id: str, votes: list[dict]
    ):
        try:
            db = next(conn())
            VotingUserRepository.register_definition_votes(
                db, voting_user_id, environment_id, votes
            )
        except Exception as e:
            print(e)
            return -1

        return True

    # ! Registrando os votos de priorização do usuário votante
    @staticmethod
    async def register_priority_votes(
        voting_user_id: str, environment_id: str, votes: list[dict]
    ):
        try:
            db = next(conn())
            VotingUserRepository.register_priority_votes(
                db, voting_user_id, environment_id, votes
            )
        except Exception as e:
            print(e)
            return -1

        return True
