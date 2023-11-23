import os
import tensorflow as tf
import tensorflow_hub as hub

# Iniciando a versão 1 do TensorFlow
tf.compat.v1.disable_eager_execution()
tf.compat.v1.disable_v2_behavior()

# Apontamento para o caminho do diretório "modulev3", onde está o USE versão 3.
# module_path = f"{os.path.dirname(os.path.abspath(__file__))}/modulev3"

# Carregando um modelo pré-treinado do TensorFlow Hub, que recebe como argumento o caminho para o diretório contendo o modelo. O modelo carregado será armazenado na variável "embed".
# embed = hub.Module(module_path)
# embed = hub.load("https://tfhub.dev/google/universal-sentence-encoder-large/3")
# embed = hub.Module("https://tfhub.dev/google/universal-sentence-encoder-large/3")
#embed = hub.Module(
    #"https://tfhub.dev/google/universal-sentence-encoder-large/5?tf-hub-format=compressed"
#)
