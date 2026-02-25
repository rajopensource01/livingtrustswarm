import sys
import time

print("Testing imports...")
print(f"1. Starting - {time.time()}")

try:
    print(f"2. Importing FastAPI - {time.time()}")
    from fastapi import FastAPI
    print("   ✓ FastAPI imported")
except Exception as e:
    print(f"   ✗ Error: {e}")
    sys.exit(1)

try:
    print(f"3. Importing database - {time.time()}")
    from models.database import init_db, Agency, Signal
    print("   ✓ Database imported")
except Exception as e:
    print(f"   ✗ Error: {e}")
    sys.exit(1)

try:
    print(f"4. Importing swarm engine - {time.time()}")
    from swarm.negotiation_engine import SwarmNegotiationEngine
    print("   ✓ SwarmNegotiationEngine imported")
except Exception as e:
    print(f"   ✗ Error: {e}")
    sys.exit(1)

try:
    print(f"5. Creating swarm engine instance - {time.time()}")
    swarm_engine = SwarmNegotiationEngine()
    print(f"   ✓ SwarmNegotiationEngine created - {time.time()}")
except Exception as e:
    print(f"   ✗ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print(f"6. All imports successful - {time.time()}")
