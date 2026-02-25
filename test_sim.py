import requests
import json

# Test agencies endpoint
print("Testing /agencies endpoint...")
try:
    r = requests.get('http://localhost:8000/agencies')
    print(f"Status: {r.status_code}")
    agencies = r.json()
    print(f"Found {len(agencies)} agencies")
    if agencies:
        print(f"First agency: {agencies[0]}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test simulation endpoint
print("Testing /simulate endpoint...")
try:
    payload = {
        "agency_id": 1,
        "signal_modifications": {
            "payment_delay_days": 10,
            "credit_utilization": 50
        }
    }
    r = requests.post('http://localhost:8000/simulate', json=payload)
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"Simulation Result:")
        print(json.dumps(result, indent=2))
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Error: {e}")
