import requests
import json

base_url = "http://127.0.0.1:5000/api/search/exercise"

queries = ["Archer", "Z Press", "Pushups", "Omoplata"] # Omoplata is meant to fail or return nothing if not added, but I added BJJ terms so maybe? unique enough.

for q in queries:
    print(f"Searching for: {q}")
    try:
        response = requests.get(f"{base_url}?q={q}")
        data = response.json()
        print(f"Results: {data.get('results')}")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)
