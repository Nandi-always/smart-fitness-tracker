import requests
import json

url = "http://127.0.0.1:5000/api/ai/chat"

test_cases = [
    {"query": "im sad", "expected_type": "mood_recommedation"},
    {"query": "complete protein intake", "expected_type": "nutrition_goal"},
    {"query": "motivate me", "expected_type": "motivation"}
]

for tc in test_cases:
    print(f"Testing query: {tc['query']}")
    try:
        response = requests.post(url, json=tc)
        data = response.json()
        print(f"Type: {data.get('type')}")
        print(f"Response: {data.get('response')}\n")
    except Exception as e:
        print(f"Error: {e}")
