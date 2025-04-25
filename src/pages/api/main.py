#importamos la librería para crear la API
from fastapi import FastAPI, HTTPException
import cx_Oracle

#Vamos a crear una variable para la API:
api = FastAPI()

#VAMOS A REALIZAR UNA CONEXIÓN CON ORACLE:
def get_conexion():
    try:
        dsn = cx_Oracle.makedsn(
            "localhost",
            1521,
            sid="xe"
        )
        conexion = cx_Oracle.connect(
            user="issa",
            password="issa",
            dsn=dsn
        )
        return conexion
    except Exception as e:
        print("Error al conectar con oracle:",e)
        raise HTTPException(
            status_code=500,
            detail="Error al conectar con la base de datos"
        )

#Método get que rescata los usuarios:
@api.get("/usuarios")
def get_usuarios():
    try:
        with get_conexion() as conexion:
            with conexion.cursor() as cursor:
                cursor.execute("SELECT rut_bodeguero, primer_nombre, email FROM bodeguero")
                rows = cursor.fetchall()

                # Construir la lista de usuarios
                lista = [
                    {
                    "rut": row[0], 
                    "nombre": row[1], 
                    "email": row[2]
                    }
                    for row in rows
                ]

                # Retornar la lista de usuarios
                return lista if lista else {"message": "No se encontraron usuarios"}
    except cx_Oracle.DatabaseError as e:
        print("Error al ejecutar la consulta:", e)
        raise HTTPException(
            status_code=500,
            detail="Error al obtener los usuarios"
        )
    except Exception as e:
        print("Error inesperado:", e)
        raise HTTPException(
            status_code=500,
            detail=f"Error inesperado: {str(e)}"
        )