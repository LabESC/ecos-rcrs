from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ! Definindo URL de conexão
url = URL.create(
    drivername="postgresql",
    username="fl0user",
    password="Zv7NLT5kXGaM",
    host="ep-winter-sun-15915881.us-east-2.aws.neon.fl0.io",
    port=5432,
    database="ecos-db",
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
