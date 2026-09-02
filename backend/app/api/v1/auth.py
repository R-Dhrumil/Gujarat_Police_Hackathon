from datetime import timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    oauth2_scheme,
    UserRole
)
from app.models.user import User
from app.models.department import Department
from app.schemas.auth import Token, UserCreate, UserOut, UserUpdate, LoginRequest
from app.services.audit_service import log_audit_event
from jose import jwt, JWTError

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.SUPER_ADMIN, UserRole.STATE_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    return current_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "department_id": user.department_id},
        expires_delta=access_token_expires
    )

    log_audit_event(
        db=db,
        action="USER_LOGIN",
        resource_type="User",
        resource_id=str(user.id),
        user_id=user.id,
        user_name=user.full_name,
        details=f"User {user.username} logged in with role {user.role}"
    )

    user_out = UserOut.from_orm(user)
    if user.department:
        user_out.department_name = user.department.name

    return {"access_token": access_token, "token_type": "bearer", "user": user_out}

@router.post("/login-json", response_model=Token)
def login_json(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "department_id": user.department_id},
        expires_delta=access_token_expires
    )

    log_audit_event(
        db=db,
        action="USER_LOGIN",
        resource_type="User",
        resource_id=str(user.id),
        user_id=user.id,
        user_name=user.full_name,
        details=f"User {user.username} logged in with role {user.role}"
    )

    user_out = UserOut.from_orm(user)
    if user.department:
        user_out.department_name = user.department.name

    return {"access_token": access_token, "token_type": "bearer", "user": user_out}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    user_out = UserOut.from_orm(current_user)
    if current_user.department:
        user_out.department_name = current_user.department.name
    return user_out

@router.post("/register", response_model=UserOut)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        department_id=user_in.department_id,
        badge_number=user_in.badge_number,
        is_active=user_in.is_active
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_audit_event(
        db=db,
        action="USER_CREATE",
        resource_type="User",
        resource_id=str(user.id),
        user_id=current_user.id,
        user_name=current_user.full_name,
        details=f"Created user {user.username} ({user.role})"
    )

    return user

@router.get("/users", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    users = db.query(User).all()
    results = []
    for u in users:
        u_out = UserOut.from_orm(u)
        if u.department:
            u_out.department_name = u.department.name
        results.append(u_out)
    return results
