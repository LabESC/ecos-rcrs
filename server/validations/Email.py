from validate_email import validate_email


class Email:
    @staticmethod
    def validate(email: str) -> bool:
        is_valid = validate_email(email, verify=True)
        return is_valid

    @staticmethod
    def validate_without_verify(email: str) -> bool:
        is_valid = validate_email(email)
        return is_valid
