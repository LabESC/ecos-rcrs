from fastapi import FastAPI

# ! Importando routes
from controller.Topic import router_topic

# ! Inicializando server FastAPI
app = FastAPI()

# ! Importando CORS
from fastapi.middleware.cors import CORSMiddleware


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ! Incluindo rotas
app.include_router(router_topic)
