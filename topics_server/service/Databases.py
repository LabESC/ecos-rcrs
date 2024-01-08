import pandas as pd
import json


class Database:
    @staticmethod
    def get_android():
        new_df = pd.DataFrame(columns=["Repositórios", "Id", "Issues"])
        # Lendo json
        with open(r"./internal_data/base_android_noTag_noClean.json") as json_file:
            data = json.load(json_file)

        for key in data:
            key_split = key.split(" - ")

            # Add at new_df
            new_df.loc[len(new_df.index)] = [key_split[0], key_split[1], data[key]]
            """new_df = new_df.append(
                {"Repositórios": key_split[0], "Id": key_split[1], "Issues": data[key]},
                ignore_index=True,
            )"""

        return new_df

    """
    @staticmethod
    def get_python():
        # Criar um dataframe Pandas associando issues com repositorios e tratando-o como uma organização
        return pd.read_json(r"E:/UNIRIO/IC/ecos-2024/atual/bases/dataframe_python.json")
    """
