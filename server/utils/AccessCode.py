import random
import string


class AccessCode:
    @staticmethod
    def generate():
        character = string.ascii_uppercase + string.digits
        return "".join(random.choice(character) for _ in range(6))
