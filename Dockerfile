FROM python:3.10.13

WORKDIR /usr/src/app
COPY ./topics_server ./
RUN pip install --upgrade pip
RUN pip install -r requirements_docker.txt
CMD ["uvicorn", "main:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "80"]