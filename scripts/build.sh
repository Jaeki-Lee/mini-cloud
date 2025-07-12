#!/bin/bash

echo "🏗️ Mini-Cloud 빌드 시작"

# Backend 빌드
echo "📦 Backend 빌드 중..."
cd ../backend
./gradlew build
if [ $? -ne 0 ]; then
    echo "❌ Backend 빌드 실패"
    exit 1
fi

# Frontend 빌드
echo "🎨 Frontend 빌드 중..."
cd ../frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend 빌드 실패"
    exit 1
fi

echo "✅ 빌드 완료!"
