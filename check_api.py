import requests
import json

base_url = "http://localhost:8000"

print("=" * 60)
print("Testing API Endpoints")
print("=" * 60)

# Test 1: Get Agencies
print("\n1. Testing GET /agencies")
try:
    r = requests.get(f"{base_url}/agencies", timeout=5)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        agencies = r.json()
        print(f"   ✓ Found {len(agencies)} agencies")
        if agencies:
            print(f"   First agency: {agencies[0].get('name')}")
    else:
        print(f"   ✗ Error: {r.text[:200]}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

# Test 2: Get Agency Detail
print("\n2. Testing GET /agency/1")
try:
    r = requests.get(f"{base_url}/agency/1", timeout=5)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        agency = r.json()
        print(f"   ✓ Agency: {agency.get('name')}")
        print(f"   Risk Score: {agency.get('current_risk_score')}")
    else:
        print(f"   ✗ Error: {r.text[:200]}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

# Test 3: Get Agent Votes
print("\n3. Testing GET /agents/votes/1")
try:
    r = requests.get(f"{base_url}/agents/votes/1", timeout=5)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"   ✓ Risk Score: {data.get('consensus_risk_score')}")
        votes = data.get('agent_votes', [])
        print(f"   Agent Votes: {len(votes)} agents")
    else:
        print(f"   ✗ Error: {r.text[:200]}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

# Test 4: Run Simulation
print("\n4. Testing POST /simulate")
try:
    payload = {
        "agency_id": 1,
        "signal_modifications": {
            "payment_delay_days": 10,
            "credit_utilization": 50,
            "chargeback_ratio": 2.0,
            "booking_spike_ratio": 30.0
        }
    }
    r = requests.post(f"{base_url}/simulate", json=payload, timeout=5)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        result = r.json()
        print(f"   ✓ Simulation completed")
        print(f"   Recommended Action: {result.get('recommended_action')}")
        print(f"   Minimum Regret: ${result.get('minimum_regret', 0):,.2f}")
    else:
        print(f"   ✗ Error {r.status_code}: {r.text[:300]}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

# Test 5: Get Swarm Lab
print("\n5. Testing GET /swarm")
try:
    r = requests.get(f"{base_url}/swarm", timeout=5)
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        print(f"   ✓ Response received")
    else:
        print(f"   ✗ Error {r.status_code}: {r.text[:200]}")
except Exception as e:
    print(f"   ✗ Exception: {e}")

print("\n" + "=" * 60)
