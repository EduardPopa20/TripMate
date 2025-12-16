#!/bin/bash

# TripMate - Environment Setup Script
# This script copies all .env.example files to .env for local development

echo "🔧 Setting up environment files for TripMate microservices..."
echo ""

# Root .env
if [ ! -f .env ]; then
    cp .env.docker.example .env
    echo "✅ Created .env from .env.docker.example"
else
    echo "⚠️  .env already exists, skipping"
fi

# Service .env files
services=(
    "api-gateway"
    "trip-service"
    "itinerary-service"
    "budget-service"
    "weather-service"
    "places-service"
    "currency-service"
)

for service in "${services[@]}"; do
    if [ ! -f "services/$service/.env" ]; then
        cp "services/$service/.env.example" "services/$service/.env"
        echo "✅ Created services/$service/.env"
    else
        echo "⚠️  services/$service/.env already exists, skipping"
    fi
done

# Shared .env
if [ ! -f "shared/.env" ]; then
    cp "shared/.env.example" "shared/.env"
    echo "✅ Created shared/.env"
else
    echo "⚠️  shared/.env already exists, skipping"
fi

echo ""
echo "✨ Environment files setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env and add your Supabase credentials:"
echo "   - SUPABASE_URL=https://your-project.supabase.co"
echo "   - SUPABASE_ANON_KEY=your_key"
echo ""
echo "2. Add your OpenWeatherMap API key:"
echo "   - OPENWEATHER_API_KEY=your_key"
echo ""
echo "3. Start the services:"
echo "   docker compose up -d"
echo ""
