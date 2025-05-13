from fastapi import APIRouter, HTTPException
from src.lib.db import get_conexion

#vamos a crear la variable para las rutas:
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

#endpoints: GET, GET, POST, PUT, DELETE, PATCH
@router.get("/")
def obtener_usuarios():
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute(
            """SELECT 
                u.nombre,
                u.apellido,
                u.rut,
                u.direccion,
                u.telefono,
                u.email,
                u.fecha_nacimiento,
                r.nombre_rol,
                g.nombre
            FROM 
                usuario u
            JOIN
                rol r on u.id_rol = r.id_rol
            JOIN
                genero g on u.id_genero = g.id_genero""",
        )
        usuarios = []
        for nombre, apellido, rut, direccion, telefono, email, fecha_nacimiento, rol, genero in cursor:
            usuarios.append({
                "nombre": nombre,
                "apellido": apellido,
                "rut": rut,
                "direccion": direccion,
                "telefono": telefono,
                "email": email,
                "fecha_nacimiento": fecha_nacimiento,
                "rol": rol,
                "genero": genero
            })
        cursor.close()
        cone.close()
        return usuarios
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.get("/{rut_buscar}")
def obtener_usuario(rut_buscar: int):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute(
            """SELECT 
                s.nombre,
                s.apellido,
                s.direccion,
                s.telefono, 
                s.email,
                s.fecha_nacimiento,
                r.nombre_rol
                g.nombre
            FROM 
                usuario s
            WHERE  
                rut = :rut
            JOIN
                rol r on s.id_rol = r.id_rol
            JOIN
                genero g on s.id_genero = g.id_genero"""
            ,{"rut": rut_buscar}
        )
        usuario = cursor.fetchone()
        cursor.close()
        cone.close()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return {
            "rut": rut_buscar,
            "nombre": usuario[0],
            "apellido": usuario[1],
            "direccion": usuario[2],
            "telefono": usuario[3],
            "email": usuario[4],
            "fecha_nacimiento": usuario[5],
            "rol": usuario[6],
            "genero": usuario[7]
        }
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.post("/")
def agregar_usuario(nombre:str, apellido: str, rut:int, direccion:str, telefono:int, email:str, fecha_nacimiento:str, id_rol:int, id_genero:int):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("""
            INSERT INTO usuario
            VALUES(:nombre, :apellido, :rut, :direccion, :telefono, :email, :fecha_nacimiento, :id_rol, :id_genero)
        """
        ,{"nombre":nombre, "apellido":apellido, "rut":rut, "direccion":direccion, "telefono":telefono, "email": email, "fecha_nacimiento":fecha_nacimiento, "id_rol":id_rol, "id_genero":id_genero})
        cone.commit()
        cursor.close()
        cone.close()
        return {"mensaje": "Alumno agregado con éxito"}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=str(ex))

@router.put("/{rut_actualizar}")
def actualizar_usuario(rut_actualizar:int, nombre:str, apellido:str, direccion:str, telefono:int, email:str, fecha_nacimiento:str, id_rol:int, id_genero:int):
    try:
        cone = get_conexion()
        cursor = cone.cursor()
        cursor.execute("""
                UPDATE usuario
                SET nombre = :nombre, apellido = :apellido, direccion = :direccion, telefonp = :telefono, email = :email, fecha_nacimiento = :fecha_nacimiento, id_rol = :id_rol, id_genero = :id_genero
                WHERE rut = :rut
        """, {"nombre":nombre, "apellido":apellido, "rut":rut_actualizar, "direccion":direccion, "telefono":telefono, "email":email, "fecha_nacimiento":fecha_nacimiento, "id_rol":id_rol, "id_genero":id_genero})
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
def eliminar_usuario(rut_eliminar: int):
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

@router.patch("/{rut_actualizar}")
def actualizar_parcial(rut_actualizar:int, nombre:Optional[str]=None, email:Optional[str]=None):
    try:
        if not nombre and not email:
            raise HTTPException(status_code=400, detail="Debe enviar al menos 1 dato")
        cone = get_conexion()
        cursor = cone.cursor()

        campos = []
        valores = {"rut": rut_actualizar}
        if nombre:
            campos.append("nombre = :nombre")
            valores["nombre"] = nombre
        if email:
            campos.append("email = :email")
            valores["email"] = email

        cursor.execute(f"UPDATE usuario SET {', '.join(campos)} WHERE rut = :rut"
                       ,valores)
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