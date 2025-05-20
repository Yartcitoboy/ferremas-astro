# Proyecto Ferremas

### Clone el Repositorio
Una vez creado el repositorio, puede clonarlo en su máquina local utilizando los siguientes comandos:

```bash
git clone https://github.com/[YOUR_USERNAME]/[YOUR_REPO_NAME].git
cd [ferremas-astro]
```

### Instalación

```bash
npm install
```
Este comando instalara todas las dependencias necesarias definidas en el archivo `package.json`.

```bash
npm install express
npm install oracledb
```
Este comando instalara node y el oracledb para trabajar con oracle en la base de datos.


una vez instaladas estas dos debemos levantar la api de este modo (debes estar dentro de la carpeta ferremas-astro en su terminal).
```bash
node src/lib/index.js
```

Aca se trabajara con FastApi - Uvicorn y oracle db, ademas de usar el ambiente virtual.

-Primero haremos el ambiente virtual.

```bash
python -m venv AcaElNombre
```
Luego entraremos al ambiente virtual - si estan con linux usaran source, si no el de windows
```bash
[Linux]-> source AcaElNombre/bin/activate - [Windows]-> AcaElNombre/Scripts/activate
```
Por ultimo instalan esto:
```bash
pip install fastapi uvicorn oracledb
```

una ves instalado haran esto:

```bash
pip freeze > requirements.txt
```

Y finalmente levantamos la api (dentro de la carpeta de ferremas-astro)

```bash
uvicorn src.lib.main:app --reload
```


### Comandos

con las dependecias instalas , puedes levantar la pagina a tu localhost

* `npm run dev`: Inicia un servidor de desarrollo local con la recarga en caliente habilitada.
* `npm run preview`: Sirve su salida de compilación localmente para obtener una vista previa antes de la implementación.
* `npm run build`: Agrupa su sitio en archivos estáticos para la producción.

