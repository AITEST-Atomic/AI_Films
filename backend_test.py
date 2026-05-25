import requests
import sys
from datetime import datetime

class AFMWorkshopAPITester:
    def __init__(self, base_url="https://stride-workshop.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, validation_fn=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success and validation_fn:
                try:
                    data = response.json()
                    validation_result = validation_fn(data)
                    if not validation_result:
                        success = False
                        print(f"❌ Failed - Validation failed")
                        self.failed_tests.append(f"{name}: Validation failed")
                except Exception as e:
                    success = False
                    print(f"❌ Failed - Validation error: {str(e)}")
                    self.failed_tests.append(f"{name}: Validation error - {str(e)}")
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")

            return success, response.json() if response.status_code == 200 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            return False, {}

    def test_get_steps_sidebar(self):
        """Test GET /api/steps - should return 8 steps with order, emoji, title, subtitle"""
        def validate(data):
            if not isinstance(data, list):
                print("  ⚠️  Response is not a list")
                return False
            if len(data) != 8:
                print(f"  ⚠️  Expected 8 steps, got {len(data)}")
                return False
            
            # Check first step structure
            first_step = data[0]
            required_fields = ['order', 'emoji', 'title', 'subtitle']
            for field in required_fields:
                if field not in first_step:
                    print(f"  ⚠️  Missing field: {field}")
                    return False
            
            # Check order sequence
            for i, step in enumerate(data, 1):
                if step['order'] != i:
                    print(f"  ⚠️  Step order mismatch at index {i}: expected {i}, got {step['order']}")
                    return False
            
            print(f"  ✓ All 8 steps present with correct structure")
            return True
        
        return self.run_test(
            "GET /api/steps (sidebar data)",
            "GET",
            "steps",
            200,
            validate
        )

    def test_get_step_by_order(self, order):
        """Test GET /api/steps/{order} - should return full step data"""
        def validate(data):
            required_fields = ['order', 'emoji', 'title', 'subtitle', 'heading', 'description', 'badgeName', 'badgeIcon']
            for field in required_fields:
                if field not in data:
                    print(f"  ⚠️  Missing field: {field}")
                    return False
            
            if data['order'] != order:
                print(f"  ⚠️  Order mismatch: expected {order}, got {data['order']}")
                return False
            
            # Check for actionItems, prompts, resources arrays
            if 'actionItems' not in data or not isinstance(data['actionItems'], list):
                print(f"  ⚠️  actionItems missing or not a list")
                return False
            
            if 'prompts' not in data or not isinstance(data['prompts'], list):
                print(f"  ⚠️  prompts missing or not a list")
                return False
            
            if 'resources' not in data or not isinstance(data['resources'], list):
                print(f"  ⚠️  resources missing or not a list")
                return False
            
            # Step 1 should have interactive choice_cards
            if order == 1:
                if 'interactive' not in data or data['interactive'] is None:
                    print(f"  ⚠️  Step 1 missing interactive field")
                    return False
                if data['interactive'].get('type') != 'choice_cards':
                    print(f"  ⚠️  Step 1 interactive type should be 'choice_cards'")
                    return False
                if 'choices' not in data['interactive'] or len(data['interactive']['choices']) != 4:
                    print(f"  ⚠️  Step 1 should have 4 choice cards")
                    return False
            
            # Step 8 should have finaleExtras
            if order == 8:
                if 'finaleExtras' not in data or data['finaleExtras'] is None:
                    print(f"  ⚠️  Step 8 missing finaleExtras")
                    return False
                finale = data['finaleExtras']
                if 'videoUrl' not in finale:
                    print(f"  ⚠️  Step 8 finaleExtras missing videoUrl")
                    return False
                if 'successStory' not in finale:
                    print(f"  ⚠️  Step 8 finaleExtras missing successStory")
                    return False
                if 'doThisNow' not in finale:
                    print(f"  ⚠️  Step 8 finaleExtras missing doThisNow")
                    return False
                if 'bonus' not in finale:
                    print(f"  ⚠️  Step 8 finaleExtras missing bonus")
                    return False
            
            print(f"  ✓ Step {order} has correct structure")
            return True
        
        return self.run_test(
            f"GET /api/steps/{order}",
            "GET",
            f"steps/{order}",
            200,
            validate
        )

    def test_get_director_levels(self):
        """Test GET /api/director-levels - should return 9 levels"""
        def validate(data):
            if not isinstance(data, list):
                print("  ⚠️  Response is not a list")
                return False
            if len(data) != 9:
                print(f"  ⚠️  Expected 9 director levels, got {len(data)}")
                return False
            
            # Check structure
            required_fields = ['min_steps', 'title', 'subtitle', 'emoji']
            for level in data:
                for field in required_fields:
                    if field not in level:
                        print(f"  ⚠️  Missing field: {field}")
                        return False
            
            # Check min_steps sequence (0-8)
            expected_min_steps = [0, 1, 2, 3, 4, 5, 6, 7, 8]
            actual_min_steps = [level['min_steps'] for level in data]
            if actual_min_steps != expected_min_steps:
                print(f"  ⚠️  min_steps sequence incorrect: {actual_min_steps}")
                return False
            
            print(f"  ✓ All 9 director levels present with correct structure")
            return True
        
        return self.run_test(
            "GET /api/director-levels",
            "GET",
            "director-levels",
            200,
            validate
        )

def main():
    print("=" * 60)
    print("AFM Workshop API Testing")
    print("=" * 60)
    
    tester = AFMWorkshopAPITester()

    # Test sidebar steps
    tester.test_get_steps_sidebar()

    # Test individual steps 1-8
    for i in range(1, 9):
        tester.test_get_step_by_order(i)

    # Test director levels
    tester.test_get_director_levels()

    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    print("=" * 60)
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failed in tester.failed_tests:
            print(f"  - {failed}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
