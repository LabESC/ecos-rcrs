from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load a pre-trained SentenceTransformer model
model = SentenceTransformer("paraphrase-MiniLM-L6-v2")


def compute_similarity(d1, d2, model):
    embeddings = model.encode([d1["body"], d2["body"]])
    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return float(similarity)


def find_related_dicts(target_dict, array, model):
    related_dicts = []

    for d in array:
        if d["id"] != target_dict["id"]:
            similarity = compute_similarity(target_dict, d, model)
            if similarity > 0.6:
                related_dicts.append({"id": d["id"], "score": similarity})

    target_dict["relatedTo"] = related_dicts
    return target_dict


def generate_topics_similarity(topic_array):
    for topic in topic_array:
        for i, d in enumerate(topic["issues"]):
            print(f"{topic['id']} = {i}")
            updated_dict = find_related_dicts(d, topic["issues"], model)
            topic["issues"][i] = updated_dict

    return topic_array


"""# Example usage:
array_of_dicts = [
    {'id': 1, 'body': "text for checking similarity", 'similarity': None, 'relatedTo': []},
    {'id': 2, 'body': "another text", 'similarity': None, 'relatedTo': []},
    {'id': 3, 'body': "more text", 'similarity': None, 'relatedTo': []},
    # Add more dictionaries as needed
]



# Print the result
for d in array_of_dicts:
    print(d)
"""
