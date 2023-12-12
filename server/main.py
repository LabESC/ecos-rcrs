from fastapi import FastAPI
from database.db import engine, Base

# ! Importando routes
from controller.User import router_user

# ! Inicializando tabelas do BD
Base.metadata.create_all(bind=engine)

# ! Inicializando server FastAPI
app = FastAPI()

# ! Incluindo rotas
app.include_router(router_user)
