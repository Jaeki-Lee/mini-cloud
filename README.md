# Mini-Cloud

OpenStack 기반 교육용 클라우드 대시보드

## 🏗️ 프로젝트 구조

```
mini-cloud/
├── backend/          # Kotlin + Spring Boot API 서버
├── frontend/         # React + Ant Design 웹 애플리케이션
├── k8s/              # Kubernetes 배포 매니페스트
├── docker/           # Docker 관련 파일들
├── docs/             # 프로젝트 문서
├── scripts/          # 빌드/배포 스크립트
└── docker-compose.yml # 로컬 개발 환경
```

## 🚀 빠른 시작

### 로컬 개발 환경 (Docker Compose)
```bash
# 전체 환경 실행
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
```

### 개별 실행
```bash
# Backend 실행
cd backend
./gradlew bootRun

# Frontend 실행  
cd frontend
npm install
npm run dev
```

## 🎯 주요 기능

- ✅ OpenStack API 프록시
- ✅ 세션 기반 인증
- ✅ VM 인스턴스 관리
- ✅ 네트워크 관리
- ✅ 볼륨 관리
- ✅ 이미지 관리

## 📚 문서

- [Backend API 문서](./docs/backend-api.md)
- [Frontend 컴포넌트 가이드](./docs/frontend-guide.md)
- [배포 가이드](./docs/deployment.md)
