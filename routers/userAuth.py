from fastapi import Depends, HTTPException, Form
from jose import jwt
from datetime import timedelta, datetime
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from src.lib.db import get_conexion
from fastapi import APIRouter
from typing import Optional

router_auth = APIRouter(
    prefix="/usuarios_auth",
    tags=["Usuarios Autenticación"]
)
# --- Configuración de seguridad ---
SECRET_KEY = "TU_CLAVE_SECRETA"  # ¡CAMBIAR EN PRODUCCIÓN!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_auth.post("/login", tags=["Autenticación"])
async def login(email: str = Form(...), contrasena: str = Form(...)):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute(
            """SELECT id_usuario, contrasena
               FROM credencial
               WHERE email = :email""",
            {"email": email}
        )
        credencial = cursor.fetchone()

        if not credencial:
            cursor.close()
            cone.close()
            raise HTTPException(status_code=400, detail="Credenciales incorrectas")

        id_usuario_credencial, hashed_password_db = credencial

        if not pwd_context.verify(contrasena, hashed_password_db):
            cursor.close()
            cone.close()
            raise HTTPException(status_code=400, detail="Credenciales incorrectas")

        # Obtener información del usuario y su rol desde la tabla 'usuario'
        cursor.execute(
            """SELECT u.rut, u.id_rol, r.nombre_rol
               FROM usuario u
               JOIN rol r ON u.id_rol = r.id_rol
               WHERE id_usuario = :id_usuario""",
            {"id_usuario": id_usuario_credencial}
        )
        user_info = cursor.fetchone()
        cursor.close()
        cone.close()

        if not user_info:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        rut, id_rol, rol_name = user_info

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token_data = {"sub": email, "role": rol_name}
        access_token = create_access_token(data=access_token_data, expires_delta=access_token_expires)
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

##-----------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/usuarios_auth/login") # La ruta del endpoint de login

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="No se pudieron validar las credenciales")
        role: str = payload.get("role")
        if role is None:
            raise HTTPException(status_code=401, detail="No se pudieron validar las credenciales")
        user_data = await get_user_from_db(email) # Función para obtener el usuario completo de la DB por email
        if user_data is None:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {"email": email, "role": role, **user_data} # Puedes incluir más datos del usuario si lo deseas
    except JWTError:
        raise HTTPException(status_code=401, detail="No se pudieron validar las credenciales")

async def get_user_from_db(email: str):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute(
            """SELECT
               u.nombre_apellidos, u.rut, u.direccion, u.telefono, u.email, u.id_rol, r.nombre_rol
               FROM usuario u
               JOIN credencial c ON u.id_usuario = c.id_usuario
               JOIN rol r ON u.id_rol = r.id_rol
               WHERE c.email = :email""",
            {"email": email}
        )
        user = cursor.fetchone()
        cursor.close()
        cone.close()
        if user:
            return {
                "nombre_apellidos": user[0],
                "rut": user[1],
                "direccion": user[2],
                "telefono": user[3],
                "email": user[4],
                "id_rol": user[5],
                "nombre_rol": user[6]
            }
        return None
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

def has_role(allowed_roles: list):
    def dependency(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="No tienes permisos para esta acción")
        return current_user
    return dependency

## PROTECION DE RUTAS@router.get("/me/", dependencies=[Depends(get_current_user)])
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router_auth.get("/admin-only/", dependencies=[Depends(has_role(["admin"]))])
async def admin_only(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hola administrador {current_user['nombre_apellidos']}"}

@router_auth.get("/publico/")
async def publico():
    return {"message": "Esta ruta es pública"}