from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ! Importando .env
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)
bd_user = os.getenv("BD_USER")
bd_pwd = os.getenv("BD_PWD")
bd_host = os.getenv("BD_HOST")
bd_db = os.getenv("BD_DATABASE")

# ! Definindo URL de conexão
url = URL.create(
    drivername="postgresql",
    username=bd_user,
    password=bd_pwd,
    host=bd_host,
    port=5432,
    database=bd_db,
)

# ! Definindo engine
engine = create_engine(
    url,
    echo=True,
)

# ! Definindo sessão e base declarativa
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ! Definindo conexão
def conn():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
