#!/bin/bash

echo "=== Testing Inter-Service Communication (Budget → Currency) ==="
echo ""

USER_ID="test-user-$(date +%s)"
TRIP_ID="test-trip-$(date +%s)"

echo "Test User ID: $USER_ID"
echo "Test Trip ID: $TRIP_ID"
echo ""

echo "Step 1: Testing Currency Service directly..."
echo "Converting 100 USD to EUR:"
CONVERT_RESULT=$(curl -s -X POST http://localhost:3006/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "EUR"}')
echo "$CONVERT_RESULT" | jq .
echo ""

echo "Step 2: Creating a mock trip (simulated - using hardcoded trip_id)..."
echo "Note: In real scenario, Trip Service would create this trip first"
echo "Using existing trip from database or creating manually via Supabase..."
echo ""

echo "Step 3: Creating expense in USD via Budget Service..."
EXPENSE_USD=$(curl -s -X POST http://localhost:3003/api/expenses \
  -H "Content-Type: application/json" \
  -H "x-user-id: 71b17a0e-c6ec-498e-9be8-1e5ad37cc902" \
  -d '{
    "trip_id": "b2c37e78-6d74-402e-ad6b-d15a84862e74",
    "day_number": 1,
    "category": "Food",
    "description": "Dinner in NYC",
    "amount": 50,
    "currency": "USD"
  }')
echo "Expense created (USD):"
echo "$EXPENSE_USD" | jq .
echo ""

echo "Step 4: Creating expense in GBP via Budget Service..."
EXPENSE_GBP=$(curl -s -X POST http://localhost:3003/api/expenses \
  -H "Content-Type: application/json" \
  -H "x-user-id: 71b17a0e-c6ec-498e-9be8-1e5ad37cc902" \
  -d '{
    "trip_id": "b2c37e78-6d74-402e-ad6b-d15a84862e74",
    "day_number": 1,
    "category": "Transport",
    "description": "Taxi in London",
    "amount": 30,
    "currency": "GBP"
  }')
echo "Expense created (GBP):"
echo "$EXPENSE_GBP" | jq .
echo ""

echo "Step 5: Getting budget summary (Budget Service calls Currency Service)..."
echo "This will convert all expenses to EUR using Currency Service!"
SUMMARY=$(curl -s "http://localhost:3003/api/budget/trip/b2c37e78-6d74-402e-ad6b-d15a84862e74/summary?currency=EUR" \
  -H "x-user-id: 71b17a0e-c6ec-498e-9be8-1e5ad37cc902")
echo "Budget Summary (all converted to EUR):"
echo "$SUMMARY" | jq .
echo ""

echo "=== Inter-Service Communication Test Complete! ==="
echo ""
echo "Check the logs to see Budget Service calling Currency Service:"
echo "  tail -f /tmp/budget-service.log"
echo "  tail -f /tmp/currency-service.log"
