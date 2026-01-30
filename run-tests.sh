#!/bin/bash

echo "🚀 Running GreatReading Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run backend tests
run_backend_tests() {
    echo -e "\n${YELLOW}📦 Running Backend Tests...${NC}"
    cd /workspaces/greatReading/backend
    
    # Install test dependencies if needed
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        pip install pytest pytest-cov httpx
    else
        source venv/bin/activate
    fi
    
    # Run tests with coverage
    echo "Running pytest with coverage..."
    if pytest --cov=app --cov-report=term-missing --cov-report=html; then
        echo -e "${GREEN}✅ Backend tests passed!${NC}"
        echo "Coverage report generated in: backend/htmlcov/index.html"
        return 0
    else
        echo -e "${RED}❌ Backend tests failed!${NC}"
        return 1
    fi
}

# Function to run frontend tests
run_frontend_tests() {
    echo -e "\n${YELLOW}🎨 Running Frontend Tests...${NC}"
    cd /workspaces/greatReading/frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Run tests
    echo "Running frontend tests..."
    if npm run test; then
        echo -e "${GREEN}✅ Frontend tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend tests failed!${NC}"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    echo -e "\n${YELLOW}🔗 Running Integration Tests...${NC}"
    
    # Start backend if not running
    if ! curl -s http://localhost:8000/health > /dev/null; then
        echo "Starting backend server..."
        cd /workspaces/greatReading/backend
        source venv/bin/activate
        uvicorn app.main:app --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!
        sleep 3
    fi
    
    # Start frontend if not running
    if ! curl -s http://localhost:5173 > /dev/null; then
        echo "Starting frontend server..."
        cd /workspaces/greatReading/frontend
        npm run dev &
        FRONTEND_PID=$!
        sleep 5
    fi
    
    # Run API tests
    echo "Testing API endpoints..."
    cd /workspaces/greatReading/backend
    source venv/bin/activate
    python -c "
import httpx
import sys

def test_endpoint(method, url, **kwargs):
    try:
        response = httpx.request(method, url, **kwargs)
        print(f'✅ {method} {url} - {response.status_code}')
        return True
    except Exception as e:
        print(f'❌ {method} {url} - {e}')
        return False

# Test basic endpoints
endpoints = [
    ('GET', 'http://localhost:8000/'),
    ('GET', 'http://localhost:8000/health'),
    ('GET', 'http://localhost:8000/docs'),
]

all_passed = True
for method, url in endpoints:
    if not test_endpoint(method, url, timeout=10):
        all_passed = False

if all_passed:
    print('\\n✅ All integration tests passed!')
    result = 0
else:
    print('\\n❌ Some integration tests failed!')
    result = 1
"
    
    # Cleanup
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    return $result
}

# Function to run performance tests
run_performance_tests() {
    echo -e "\n${YELLOW}⚡ Running Performance Tests...${NC}"
    cd /workspaces/greatReading/backend
    source venv/bin/activate
    
    echo "Running load tests..."
    python -c "
import time
import concurrent.futures
import httpx
from datetime import datetime

def make_request(url):
    start = time.time()
    try:
        response = httpx.get(url, timeout=5)
        duration = time.time() - start
        return {'success': True, 'duration': duration, 'status': response.status_code}
    except Exception as e:
        duration = time.time() - start
        return {'success': False, 'duration': duration, 'error': str(e)}

print('Testing endpoint performance...')
urls = ['http://localhost:8000/health'] * 10  # 10 concurrent requests

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    start_time = time.time()
    results = list(executor.map(make_request, urls))
    total_time = time.time() - start_time

successful = sum(1 for r in results if r['success'])
durations = [r['duration'] for r in results if r['success']]

if durations:
    avg_duration = sum(durations) / len(durations)
    max_duration = max(durations)
    min_duration = min(durations)
else:
    avg_duration = max_duration = min_duration = 0

print(f'\\nResults:')
print(f'  Total requests: {len(urls)}')
print(f'  Successful: {successful}/{len(urls)}')
print(f'  Total time: {total_time:.2f}s')
print(f'  Average response: {avg_duration*1000:.1f}ms')
print(f'  Fastest: {min_duration*1000:.1f}ms')
print(f'  Slowest: {max_duration*1000:.1f}ms')

if successful == len(urls) and avg_duration < 0.5:
    print('\\n✅ Performance tests passed!')
else:
    print('\\n⚠️  Performance issues detected')
"
    
    return 0
}

# Function to generate test report
generate_report() {
    echo -e "\n${YELLOW}📊 Generating Test Report...${NC}"
    
    REPORT_FILE="/workspaces/greatReading/test-report.md"
    
    cat > "$REPORT_FILE" << EOR
# GreatReading Test Report
Generated: $(date)

## Test Summary
- ✅ Backend Tests: $(if [ $BACKEND_RESULT -eq 0 ]; then echo "PASSED"; else echo "FAILED"; fi)
- ✅ Frontend Tests: $(if [ $FRONTEND_RESULT -eq 0 ]; then echo "PASSED"; else echo "FAILED"; fi)
- ✅ Integration Tests: $(if [ $INTEGRATION_RESULT -eq 0 ]; then echo "PASSED"; else echo "FAILED"; fi)

## Coverage Reports
- Backend: backend/htmlcov/index.html
- Frontend: frontend/coverage/index.html

## Performance Metrics
EOR
    
    # Add performance metrics
    cd /workspaces/greatReading/backend && python -c "
import psutil
import os
print(f'- Memory Usage: {psutil.Process().memory_info().rss / 1024 / 1024:.1f} MB')
print(f'- CPU Usage: {psutil.cpu_percent()}%')
print(f'- Disk Usage: {psutil.disk_usage(\".\").percent}%')
" >> "$REPORT_FILE"
    
    cat >> "$REPORT_FILE" << EOR

## Next Steps
1. Review failing tests
2. Check coverage reports
3. Run performance tests
4. Deploy to staging

EOR
    
    echo -e "${GREEN}📄 Report generated: $REPORT_FILE${NC}"
}

# Main execution
main() {
    echo "Starting comprehensive test suite..."
    
    # Run all test suites
    run_backend_tests
    BACKEND_RESULT=$?
    
    run_frontend_tests
    FRONTEND_RESULT=$?
    
    run_integration_tests
    INTEGRATION_RESULT=$?
    
    run_performance_tests
    
    # Generate report
    generate_report
    
    # Summary
    echo -e "\n${YELLOW}==================================${NC}"
    echo -e "${YELLOW}Test Suite Complete${NC}"
    echo -e "${YELLOW}==================================${NC}"
    
    if [ $BACKEND_RESULT -eq 0 ] && [ $FRONTEND_RESULT -eq 0 ] && [ $INTEGRATION_RESULT -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        echo "The application is ready for deployment."
    else
        echo -e "${RED}⚠️ Some tests failed.${NC}"
        echo "Please check the test reports above."
        exit 1
    fi
}

# Run main function
main
