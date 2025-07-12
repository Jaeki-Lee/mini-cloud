# 배포 가이드

## 로컬 개발
```bash
# 개발 환경 시작
./scripts/dev-start.sh

# 또는 개별 실행
cd backend && ./gradlew bootRun
cd frontend && npm run dev
```

## Docker 배포
```bash
# 이미지 빌드
./scripts/docker-build.sh

# 실행
docker-compose up -d
```

## Kubernetes 배포
```bash
kubectl apply -f k8s/
```
