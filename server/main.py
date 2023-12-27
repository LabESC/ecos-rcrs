from fastapi import FastAPI
from database.db import engine, Base

# ! Importando routes
from controller.User import router_user
from controller.VotingUser import router_voting_user
from controller.Environment import router_environment

# ! Inicializando server FastAPI
app = FastAPI()

# ! Incluindo rotas
app.include_router(router_user)
app.include_router(router_voting_user)
app.include_router(router_environment)

# ! Inicializando tabelas do BD
Base.metadata.create_all(bind=engine)
