import requests
import sys
from datetime import datetime

class AFMWorkshopAPITester:
    def __init__(self, base_url="https://docker-nginx-setup.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_session_id = f"test_sess_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.text}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_get_steps_sidebar(self):
        """Test getting sidebar steps"""
        success, response = self.run_test(
            "Get Steps Sidebar",
            "GET",
            "steps",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} steps")
            if len(response) > 0:
                print(f"   First step: {response[0]}")
        return success

    def test_get_step_by_order(self, order=1):
        """Test getting a specific step"""
        success, response = self.run_test(
            f"Get Step {order}",
            "GET",
            f"steps/{order}",
            200
        )
        if success:
            print(f"   Step title: {response.get('title', 'N/A')}")
            print(f"   Step heading: {response.get('heading', 'N/A')}")
        return success

    def test_get_nonexistent_step(self):
        """Test getting a non-existent step (should return 404)"""
        return self.run_test(
            "Get Non-existent Step (999)",
            "GET",
            "steps/999",
            404
        )

    def test_get_director_levels(self):
        """Test getting director levels"""
        success, response = self.run_test(
            "Get Director Levels",
            "GET",
            "director-levels",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} director levels")
            if len(response) > 0:
                print(f"   First level: {response[0]}")
        return success

    def test_save_progress_new(self):
        """Test saving new progress"""
        payload = {
            "sessionId": self.test_session_id,
            "completedSteps": [1, 2],
            "step1Choice": "own_brand",
            "currentStep": 3
        }
        success, response = self.run_test(
            "Save New Progress (POST /api/progress)",
            "POST",
            "progress",
            200,
            data=payload
        )
        if success:
            print(f"   Progress saved for session: {self.test_session_id}")
        return success

    def test_get_progress(self):
        """Test getting saved progress"""
        success, response = self.run_test(
            f"Get Progress (GET /api/progress/{self.test_session_id})",
            "GET",
            f"progress/{self.test_session_id}",
            200
        )
        if success:
            print(f"   Session ID: {response.get('sessionId', 'N/A')}")
            print(f"   Completed Steps: {response.get('completedSteps', [])}")
            print(f"   Step 1 Choice: {response.get('step1Choice', 'N/A')}")
            print(f"   Current Step: {response.get('currentStep', 'N/A')}")
        return success

    def test_update_progress(self):
        """Test updating existing progress (upsert)"""
        payload = {
            "sessionId": self.test_session_id,
            "completedSteps": [1, 2, 3, 4],
            "step1Choice": "client",
            "currentStep": 5
        }
        success, response = self.run_test(
            "Update Existing Progress (POST /api/progress - upsert)",
            "POST",
            "progress",
            200,
            data=payload
        )
        if success:
            print(f"   Progress updated for session: {self.test_session_id}")
        return success

    def test_get_updated_progress(self):
        """Test getting updated progress to verify upsert"""
        success, response = self.run_test(
            f"Verify Updated Progress (GET /api/progress/{self.test_session_id})",
            "GET",
            f"progress/{self.test_session_id}",
            200
        )
        if success:
            completed = response.get('completedSteps', [])
            choice = response.get('step1Choice', '')
            current = response.get('currentStep', 0)
            
            # Verify the update worked
            if completed == [1, 2, 3, 4] and choice == "client" and current == 5:
                print(f"   ✅ Progress correctly updated!")
            else:
                print(f"   ⚠️  Progress may not have updated correctly")
                print(f"   Expected: completedSteps=[1,2,3,4], step1Choice='client', currentStep=5")
                print(f"   Got: completedSteps={completed}, step1Choice='{choice}', currentStep={current}")
        return success

    def test_get_nonexistent_progress(self):
        """Test getting progress for unknown session (should return 404)"""
        return self.run_test(
            "Get Progress for Unknown Session (should 404)",
            "GET",
            "progress/unknown_session_12345",
            404
        )

    def test_reset_progress(self):
        """Test resetting progress"""
        payload = {
            "sessionId": self.test_session_id,
            "completedSteps": [],
            "step1Choice": None,
            "currentStep": 1
        }
        success, response = self.run_test(
            "Reset Progress (POST /api/progress with empty data)",
            "POST",
            "progress",
            200,
            data=payload
        )
        if success:
            print(f"   Progress reset for session: {self.test_session_id}")
        return success

    def test_get_reset_progress(self):
        """Test getting reset progress to verify"""
        success, response = self.run_test(
            f"Verify Reset Progress (GET /api/progress/{self.test_session_id})",
            "GET",
            f"progress/{self.test_session_id}",
            200
        )
        if success:
            completed = response.get('completedSteps', [])
            choice = response.get('step1Choice')
            current = response.get('currentStep', 0)
            
            # Verify the reset worked
            if completed == [] and choice is None and current == 1:
                print(f"   ✅ Progress correctly reset!")
            else:
                print(f"   ⚠️  Progress may not have reset correctly")
                print(f"   Expected: completedSteps=[], step1Choice=None, currentStep=1")
                print(f"   Got: completedSteps={completed}, step1Choice={choice}, currentStep={current}")
        return success

def main():
    print("=" * 70)
    print("AFM WORKSHOP API TESTING")
    print("=" * 70)
    
    tester = AFMWorkshopAPITester()

    # Test basic endpoints
    print("\n" + "=" * 70)
    print("TESTING BASIC ENDPOINTS")
    print("=" * 70)
    tester.test_root_endpoint()
    tester.test_get_steps_sidebar()
    tester.test_get_step_by_order(1)
    tester.test_get_step_by_order(8)
    tester.test_get_nonexistent_step()
    tester.test_get_director_levels()

    # Test progress sync endpoints
    print("\n" + "=" * 70)
    print("TESTING PROGRESS SYNC ENDPOINTS")
    print("=" * 70)
    tester.test_save_progress_new()
    tester.test_get_progress()
    tester.test_update_progress()
    tester.test_get_updated_progress()
    tester.test_get_nonexistent_progress()
    tester.test_reset_progress()
    tester.test_get_reset_progress()

    # Print results
    print("\n" + "=" * 70)
    print("TEST RESULTS")
    print("=" * 70)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n✅ ALL TESTS PASSED!")
        return 0
    else:
        print(f"\n❌ {tester.tests_run - tester.tests_passed} TEST(S) FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())
