import bcrypt


class User:
    @staticmethod
    def validate_password(password_user: str, password_db: bytes) -> bool:
        return bcrypt.checkpw(
            password_user.encode("utf-8"), password_db
        )
