from cryptography.fernet import Fernet
from app.core.config import settings


def _get_fernet() -> Fernet:
    return Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt_value(text: str) -> str:
    """Matnni shifrlaydi va base64 string qaytaradi."""
    return _get_fernet().encrypt(text.encode()).decode()


def decrypt_value(token: str) -> str:
    """Shifrlangan tokenni qaytadan ochadi."""
    return _get_fernet().decrypt(token.encode()).decode()
