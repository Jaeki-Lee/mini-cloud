#!/bin/bash

echo "🚀 Mini-Cloud 개발 환경 시작"

# Backend 시작 (백그라운드)
echo "📦 Backend 시작 중..."
cd ../backend
./gradlew bootRun &
BACKEND_PID=$!

# Frontend 시작 (백그라운드)
echo "🎨 Frontend 시작 중..."
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo "✅ 개발 환경 시작 완료!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend: http://localhost:8080"
echo "📍 API Docs: http://localhost:8080/swagger-ui.html"
echo ""
echo "종료하려면 Ctrl+C를 누르세요"

# 종료 신호 처리
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
