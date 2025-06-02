## PROYECTO FERREMAS
## Instalación

Instalar el proyecto con npm install

```bash
  npm install 
```
Luego instalar las demás dependencias dentro de la carpeta ferremas-astro
```bash
  npm install express oracledb
```
Aca se trabajara con el ambiente virtual.
```bash
  python -m venv AcaElNombre
```
Dentro del ambiente instalar dependencias necesarias
```bash
  pip oracledb fastapi uvicorn python-jose[cryptography] python-multipart passlib bcrypt
```
Una vez instalado se hara esto
```bash
  pip freeze > requirements.txt
```
Y finalmente levantamos la api (dentro de la carpeta de ferremas-astro)
PARA EXPRESS
```bash
  node src/lib/index.js
```
PARA FASTAPI
```bash
  uvicorn src.lib.main:app --reload
```
y corremos el proyecto
```bash
  npm run dev
```

## .ENV aca crean el .env dentro de ferremas-astro

**PUERTO**

PORT=6500

**--------------------**

**BASE DE DATOS**

DB_USER=

DB_PASSWORD=

DB_CONNECTION_STRING=

DSN=

**--------------------**

**APYKEY**

API_KEY=

**URL DEL BACKED DE EXPRESS**

public_api_url=

**URL DEL FROM DE PAYPAL**

PAYPAL_CLIENT_ID=

PAYPAL_CLIENT_SECRET=




## Expresiones de gratitud

 - [Template](https://astro.build/themes/details/screwfast/)
 - [README](https://readme.so/es)


## Pila de tecnología

**Client:** Astro, Vue, TailwindCSS

**LENGUAJE** Java, TypeScript, Python

**DATA BASE:** ORACLE

**APIs:** FASTAPI y EXPRESS


## Autores

- [@Is4](https://github.com/Yartcitoboy)
- [@Liz](https://github.com/alli-rubio)
- [@Charly](https://github.com/apeleoca)

