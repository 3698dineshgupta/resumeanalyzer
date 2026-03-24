"""
Authentication helper utilities.
"""
import bcrypt


def hash_password(plain: str) -> str:
    """Return a bcrypt-hashed password string."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(plain: str, hashed: str) -> bool:
    """Verify a plain-text password against a stored hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
