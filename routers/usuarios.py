from fastapi import APIRouter, HTTPException
from src.lib.db import get_conexion
from fastapi import Form
from passlib.context import CryptContext

#vamos a crear la variable para las rutas:
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#endpoints: GET, GET, POST, PUT, DELETE, PATCH
@router.get("/")
def obtener_usuarios():
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute(
            """SELECT 
                u.nombre_apellidos,
                u.rut,
                u.direccion,
                u.telefono,
                u.email,
                u.contrasena,
                r.nombre_rol
            FROM 
                usuario u
            JOIN
                rol r on u.id_rol = r.id_rol""",
        )
        usuarios = []
        for nombre_apellidos, rut, direccion, telefono, email, contrasena, rol in cursor:
            usuarios.append({
                "nombre_apellidos": nombre_apellidos,
                "rut": rut,
                "direccion": direccion,
                "telefono": telefono,
                "email": email,
                "contrasena": contrasena,
                "rol": rol
            })
        cursor.close()
        cone.close()
        return usuarios
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.get("/{rut_buscar}")
def obtener_usuario(rut_buscar: str):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute(
            """SELECT 
                u.nombre_apellidos,
                u.direccion,
                u.telefono, 
                u.email,
                u.contrasena,
                r.nombre_rol,
            FROM 
                usuario u
            WHERE  
                rut = :rut
            JOIN
                rol r on u.id_rol = r.id_rol"""
            ,{"rut": rut_buscar}
        )
        usuario = cursor.fetchone()
        cursor.close()
        cone.close()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "rut": rut_buscar,
            "nombre_apellidos": usuario[0],
            "direccion": usuario[1],
            "telefono": usuario[2],
            "email": usuario[3],
            "contrasena": usuario[4],
            "rol": usuario[5],
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.post("/")
def agregar_usuario(
    nombre_apellidos: str = Form(...),
    rut: str = Form(...),
    direccion: str = Form(...),
    telefono: str = Form(...),
    email: str = Form(...),
    contrasena: str = Form(...),
    id_rol: int = Form(...)
):
    print("rut:", rut, type(rut))
    print("telefono:", telefono, type(telefono))
    print("id_rol:", id_rol, type(id_rol))
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        hashed_password = pwd_context.hash(contrasena)
        
        cursor.execute("SELECT 1 FROM usuario WHERE rut = :rut OR email = :email", {"rut": rut, "email": email})
        if cursor.fetchone():
            cursor.close()
            cone.close()
            raise HTTPException(status_code=400, detail="El rut o email ya están registrados.")

        # Insertar en la tabla 'usuario' y obtener el id_usuario generado
        cursor.execute("""
    INSERT INTO usuario (
        nombre_apellidos, rut, direccion, telefono, email, contrasena, id_rol
    )
    VALUES (
        :nombre_apellidos, :rut, :direccion, :telefono, :email, :contrasena, :id_rol
    )
""", {
    "nombre_apellidos": nombre_apellidos,
    "rut": rut,
    "direccion": direccion,
    "telefono": telefono,
    "email": email,
    "contrasena": hashed_password,
    "id_rol": id_rol
})
        # Obtener el id_usuario de la última inserción using a sequence or similar if needed
        cursor.execute("SELECT id_usuario FROM usuario WHERE email = :email", {"email": email})
        user_result = cursor.fetchone()
        if not user_result:
            cone.rollback()
            cursor.close()
            cone.close()
            raise HTTPException(status_code=500, detail="Error al obtener ID de usuario")
        user_id = user_result[0]
        cone.commit()

        # Insertar en la tabla 'credencial'
        cursor.execute("""
    INSERT INTO credencial (
        id_usuario, email, contrasena
    )
    VALUES (
        :id_usuario, :email, :contrasena
    )
""", {
    "id_usuario": user_id,
    "email": email,
    "contrasena": hashed_password
})
        cone.commit()

        cursor.close()
        cone.close()
        return {"mensaje": "Usuario registrado con éxito"}
    except Exception as ex:
        cone.rollback()
        cursor.close()
        cone.close()
        raise HTTPException(status_code=500, detail=str(ex))

@router.put("/{rut_actualizar}")
def actualizar_usuario(rut_actualizar:str, nombre_apellidos:str, direccion:str, telefono:str, email:str, contrasena:str, id_rol:int):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("""
                UPDATE usuario
                SET nombre_apellidos = :nombre_apellidos, direccion = :direccion, telefonp = :telefono, email = :email, contrasena = :contrasena, id_rol = :id_rol
                WHERE rut = :rut
        """, {"nombre_apellidos":nombre_apellidos, "rut":rut_actualizar, "direccion":direccion, "telefono":telefono, "email":email, "contrasena":contrasena, "id_rol":id_rol})
        if cursor.rowcount==0:
            cursor.close()
            cone.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        cone.commit()
        cursor.close()
        cone.close()
        return {"mensaje": "Usuario actualizado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.delete("/{rut_eliminar}")
def eliminar_usuario(rut_eliminar: str):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("DELETE FROM usuario WHERE rut = :rut"
                       ,{"rut": rut_eliminar})
        if cursor.rowcount==0:
            cursor.close()
            cone.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        cone.commit()
        cursor.close()
        cone.close()
        return {"mensaje": "Usuario eliminado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))


from typing import Optional

from typing import Optional
from fastapi import Form

@router.patch("/{rut_actualizar}")
def actualizar_parcial(
    rut_actualizar: str,
    nombre_apellidos: Optional[str] = Form(None),
    direccion: Optional[str] = Form(None),
    telefono: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    contrasena: Optional[str] = Form(None),
    id_rol: Optional[int] = Form(None)
):
    try:
        campos = []
        valores = {"rut": rut_actualizar}
        if nombre_apellidos:
            campos.append("nombre_apellidos = :nombre_apellidos")
            valores["nombre_apellidos"] = nombre_apellidos
        if direccion:
            campos.append("direccion = :direccion")
            valores["direccion"] = direccion
        if telefono:
            campos.append("telefono = :telefono")
            valores["telefono"] = telefono
        if email:
            campos.append("email = :email")
            valores["email"] = email
        if contrasena:
            # Si quieres hashear la contraseña, descomenta la siguiente línea:
            # valores["contrasena"] = pwd_context.hash(contrasena)
            valores["contrasena"] = contrasena
            campos.append("contrasena = :contrasena")
        if id_rol is not None:
            campos.append("id_rol = :id_rol")
            valores["id_rol"] = id_rol

        if not campos:
            raise HTTPException(status_code=400, detail="Debe enviar al menos un dato para actualizar")

        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute(
            f"UPDATE usuario SET {', '.join(campos)} WHERE rut = :rut",
            valores
        )
        if cursor.rowcount == 0:
            cursor.close()
            cone.close()
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        cone.commit()
        cursor.close()
        cone.close()
        return {"mensaje": "Usuario actualizado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))
    
