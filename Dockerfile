FROM python:3.10.14

WORKDIR /usr/src/app
COPY ./topics_server/controller ./controller
COPY ./topics_server/internal_data ./internal_data
COPY ./topics_server/schemas ./schemas
COPY ./topics_server/service ./service
COPY ./topics_server/main.py ./main.py
COPY ./topics_server/.env ./.env
COPY ./topics_server/new_requirements.txt ./new_requirements.txt
RUN pip install --upgrade pip
RUN pip install -r new_requirements.txt
CMD ["uvicorn", "main:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "80"]