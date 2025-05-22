from fastapi import FastAPI

from routers import usuarios, userAuth
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="API de gestión de usuarios",
    version="1.0.0",
    description="API para gestionar usuario usando FastAPI y Oracle"
)

origins = [
    "http://localhost:4321",  # El origen de tu frontend de Astro
    # Puedes agregar más orígenes si es necesario
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Permite todos los headers
)


#Traeremos lo de las rutas(routers):
app.include_router(usuarios.router)
app.include_router(userAuth.router_auth)