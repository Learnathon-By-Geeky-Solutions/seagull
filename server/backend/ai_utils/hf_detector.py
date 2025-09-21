import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://api-inference.huggingface.co/models/unitary/toxic-bert?wait_for_model=true"





API_KEY = os.getenv("HUGGINGFACE_API_KEY")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}"
}

def detect_toxic_content(text):
    payload = {"inputs": text}
    response = requests.post(API_URL, headers=HEADERS, json=payload)

    if response.status_code != 200:
        return {"error": f"{response.status_code}: {response.text}"}

    return response.json()

