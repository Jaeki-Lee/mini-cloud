#!/bin/bash

echo "🐳 Docker 이미지 빌드 시작"

cd ..

# Backend 이미지 빌드
echo "📦 Backend Docker 이미지 빌드 중..."
docker build -f docker/Dockerfile.backend -t minicloud-backend:latest .

# Frontend 이미지 빌드
echo "🎨 Frontend Docker 이미지 빌드 중..."
docker build -f docker/Dockerfile.frontend -t minicloud-frontend:latest .

echo "✅ Docker 이미지 빌드 완료!"
echo "🚀 실행: docker-compose up -d"
