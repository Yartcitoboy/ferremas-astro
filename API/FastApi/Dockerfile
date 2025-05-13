FROM python:3.12-slim

# Configuración de entorno
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PYTHONUNBUFFERED=1

# Establece el directorio de trabajo
WORKDIR /app

# Instala herramientas de compilación y dependencias para cx_Oracle
RUN apt-get update && apt-get install -y \
    gcc \
    libaio1 \
    libaio-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia el archivo de dependencias
COPY ../../requirements.txt /app/requirements.txt

# Crea un entorno virtual y instala las dependencias
RUN python -m venv diva
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copia el resto del proyecto al contenedor
COPY . .

# Expone el puerto 8000
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]