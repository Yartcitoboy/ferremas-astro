import oracledb

def get_conexion():
    conexion = oracledb.connect(
        user="ferre",
        password="ferre",
        dsn="localhost:1521/xe"
    )
    return conexion