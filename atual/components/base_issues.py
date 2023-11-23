import pandas as pd


def android_base():
    # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
    return pd.read_json(r"E:/UNIRIO/IC/ecos-2024/atual/bases/base_android_df.json")



def python_base():
    # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
    return pd.read_json(r"E:/UNIRIO/IC/ecos-2024/atual/bases/dataframe_python.json")
