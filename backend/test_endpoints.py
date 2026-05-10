import time
from fastapi.testclient import TestClient
from main import app
from middleware.rate_limit import _request_log

client = TestClient(app)

def run_tests():
    print("--- 1. Health Endpoints ---")
    resp = client.get("/")
    print("GET /:", resp.status_code, resp.json())
    assert resp.status_code == 200
    assert resp.json() == {"status": "running", "version": "1.0.0"}

    resp = client.get("/health")
    print("GET /health:", resp.status_code, resp.json())
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "version": "1.0.0"}
    
    print("\n--- 2. Happy Path — All 6 Tones ---")
    tones = ["casual", "corporate", "dramatic", "technical", "poetic", "villain"]
    for tone in tones:
        resp = client.post("/excuse", json={"situation": "missed standup", "tone": tone})
        assert resp.status_code == 200, f"Failed for tone {tone}: {resp.json()}"
        data = resp.json()
        print(f"[{tone.upper()}]\n{data['excuse']}\n")

    print("\n--- 3. Default Tone Behaviour ---")
    resp = client.post("/excuse", json={"situation": "missed standup"})
    assert resp.status_code == 200
    data = resp.json()
    print("Default Tone:", data["tone"])
    assert data["tone"] == "casual"

    print("\n--- 4. Context Field ---")
    resp = client.post("/excuse", json={
        "situation": "late assignment", 
        "tone": "dramatic", 
        "context": "talking to my professor"
    })
    print("Dramatic/Professor:\n", resp.json()["excuse"])
    
    resp = client.post("/excuse", json={
        "situation": "missed call", 
        "tone": "corporate", 
        "context": "texting my manager"
    })
    print("\nCorporate/Manager:\n", resp.json()["excuse"])

    print("\n--- 5. Validation Errors (422) ---")
    _request_log.clear()
    errors = [
        {"situation": "", "tone": "casual"},
        {"situation": "hi", "tone": "casual"},
        {"situation": "missed standup", "tone": "sarcastic"},
        {"situation": "a" * 301, "tone": "casual"},
        {"situation": "missed standup", "tone": "casual", "context": "b" * 201},
        {} # Missing situation entirely
    ]
    for e in errors:
        resp = client.post("/excuse", json=e)
        print(f"Payload: {str(e)[:50]}... -> Status: {resp.status_code}")
        assert resp.status_code == 422
        
    print("\n--- 6. Rate Limiting (429) ---")
    _request_log.clear()
    # First let's hit it 10 times quickly
    for i in range(10):
        resp = client.post("/excuse", json={"situation": f"rate limit test {i}"})
        if resp.status_code != 200:
            print(f"Failed at request {i}: {resp.status_code}")
            break
            
    # The 11th should fail
    resp = client.post("/excuse", json={"situation": "rate limit test 11"})
    print("11th Request Status:", resp.status_code)
    print("11th Request Body:", resp.json())
    assert resp.status_code == 429
    assert "retry_after_seconds" in resp.json()["detail"]
    assert "message" in resp.json()["detail"]

    # We skip the 60s wait in script, but rate limit works
    
    print("\n--- 7. Response Shape ---")
    _request_log.clear()
    resp = client.post("/excuse", json={"situation": "missed standup", "tone": "casual"})
    data = resp.json()
    keys = list(data.keys())
    keys.sort()
    expected_keys = ["excuse", "model", "situation", "tone"]
    print("Keys:", keys)
    assert keys == expected_keys
    assert data["model"] == "llama-3.3-70b-versatile"
    assert data["situation"] == "missed standup"
    assert data["tone"] == "casual"
    assert len(data["excuse"]) > 0

    print("\n--- 8. Output Quality Checks ---")
    print("No preamble/quotes check handled visually above.")
    resp1 = client.post("/excuse", json={"situation": "missed standup", "tone": "casual"})
    resp2 = client.post("/excuse", json={"situation": "missed standup", "tone": "casual"})
    excuse1 = resp1.json()["excuse"]
    excuse2 = resp2.json()["excuse"]
    print("Temp=0.9 difference check:")
    print("1:", excuse1)
    print("2:", excuse2)
    assert excuse1 != excuse2

    print("\nALL TESTS PASSED (Check visual output for tone constraints)")

if __name__ == "__main__":
    run_tests()
