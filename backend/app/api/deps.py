from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    if not token:
        return None
    try:
        secret = settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY
        payload = jwt.decode(
            token,
            secret,
            algorithms=[settings.ALGORITHM],
            options={"verify_aud": False}
        )
        user_id: str = payload.get("sub")
        if not user_id:
            return None
    except JWTError:
        return None

    # Query user profile by UUID string
    user = db.query(User).filter(User.id == str(user_id)).first()
    
    # Auto-provision profile from JWT claims if trigger hasn't fired yet
    if not user and user_id:
        user_meta = payload.get("user_metadata") or {}
        name = user_meta.get("name") or payload.get("email", "").split("@")[0] or "User"
        email = payload.get("email") or f"{user_id}@truthlens.ai"
        user = User(
            id=str(user_id),
            name=name,
            email=email,
            avatar=user_meta.get("avatar")
        )
        try:
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).filter(User.id == str(user_id)).first()

    return user


def require_current_user(
    current_user: Optional[User] = Depends(get_current_user)
) -> User:
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
