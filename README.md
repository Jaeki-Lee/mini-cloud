# Mini Cloud - OpenStack 관리 시스템

OpenStack-helm 을 통한 k8s 위에 openstack 을 서비스 하였습니다.
해당 Openstack 클러스터를 관리하기 위한 웹 기반 대시보드 시스템입니다.

## 📋 프로젝트 개요

**Mini Cloud**는 Kubernetes 상에서 구동되는 OpenStack 클러스터를 보다 **직관적이고 손쉽게 관리**할 수 있도록 설계된 웹 기반 인터페이스입니다.  
기존의 데몬 기반 OpenStack 서비스와 달리, Kubernetes의 **유연한 스케일링** 및 **고가용성** 특성을 적극 활용하여 클라우드 리소스를 보다 **안정적이고 효율적으로 운영**할 수 있습니다.

---

## 🔧 주요 특징

- **Spring Boot** 기반의 Backend
- **React** 기반의 Frontend
- **OpenStack 주요 서비스**들과 직접 연동 (Keystone, Nova, Glance 등)

---

## 💡 제공 기능

- 프로젝트 / 사용자 / 리소스 **통합 관리**
- 인스턴스 / 이미지 / 네트워크 리소스 **시각화**
- 리소스의 **실시간 상태 모니터링 및 통계 제공**
- OpenStack API 호출을 손쉽게 처리할 수 있는 **사용자 친화적 UI 제공**

---

## 🎯 기대 효과

Mini Cloud를 통해 복잡하고 방대한 OpenStack 환경을 누구나 **손쉽게, 명확하게, 효율적으로 관리**할 수 있습니다.


## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   OpenStack     │
│   (React)       │───▶│  (Spring Boot)  │───▶│   Services      │
│   Port: 3001    │    │   Port: 8080    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Frontend**: React 18 + TypeScript + Ant Design + Vite
- **Backend**: Spring Boot 3 + Kotlin + WebFlux 
- **OpenStack 연동**: Keystone, Nova, Glance.. 등 openstack API, MariaDB, RabitMQ, Ceph

## ✅ 완성된 기능

### 🔐 인증 시스템
- [x] OpenStack Keystone 인증
- [x] 세션 기반 로그인/로그아웃
- [x] 프로젝트 및 도메인 관리
- [x] 사용자 권한 관리

### 📊 대시보드
- [x] 실시간 리소스 통계
  - 총 인스턴스 수 / 실행 중인 인스턴스 수
  - 총 이미지 수 / 활성 이미지 수
- [x] 사용자 및 프로젝트 정보 표시
- [x] 빠른 작업 메뉴

### 🖥️ 인스턴스 관리
- [x] 인스턴스 목록 조회 (실시간 상태)
- [x] 인스턴스 생성 (이미지, Flavor 선택)
- [x] 인스턴스 상세 정보 조회
- [x] 인스턴스 제어 (시작/중지/재시작/삭제)
- [x] 상태별 필터링 및 검색

### 🖼️ 이미지 관리
- [x] 이미지 목록 조회
- [x] 이미지 상세 정보 (크기, 형식, 상태 등)
- [x] 이미지 통계 (전체/활성/공개 이미지)
- [x] 이미지 상태별 태그 표시

### 🔧 시스템 기능
- [x] 반응형 UI 디자인
- [x] 실시간 데이터 업데이트
- [x] 오류 처리 및 로딩 상태
- [x] 세션 관리 및 보안

## 🚀 실행 방법

### 1. 백엔드 실행
```bash
cd backend
./gradlew bootRun
```
- 포트: 8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### 2. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```
- 포트: 3001 (또는 사용 가능한 다음 포트)
- 웹 접속: http://localhost:3001

### 3. 로그인 정보
- **사용자명**: admin
- **비밀번호**: password
- **프로젝트**: admin
- **도메인**: default

## 📁 프로젝트 구조

```
mini-cloud/
├── backend/                    # Spring Boot 백엔드
│   ├── src/main/kotlin/
│   │   └── com/minicloud/
│   │       ├── api/           # REST API 컨트롤러
│   │       │   ├── AuthController.kt
│   │       │   ├── InstanceController.kt
│   │       │   ├── ImageController.kt
│   │       │   └── StatsController.kt
│   │       ├── service/       # 서비스 레이어
│   │       │   ├── AuthService.kt
│   │       │   ├── NovaClient.kt
│   │       │   └── GlanceClient.kt
│   │       ├── model/         # 데이터 모델
│   │       └── config/        # 설정 파일
│   └── build.gradle.kts
├── frontend/                  # React 프론트엔드
│   ├── src/
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── pages/            # 페이지 컴포넌트
│   │   │   ├── auth/         # 인증 관련
│   │   │   ├── dashboard/    # 대시보드
│   │   │   ├── instances/    # 인스턴스 관리
│   │   │   └── images/       # 이미지 관리
│   │   ├── services/         # API 서비스
│   │   ├── types/           # TypeScript 타입
│   │   └── store/           # 상태 관리
│   ├── package.json
│   └── vite.config.ts
├── k8s/                       # Kubernetes 배포 매니페스트
├── docker/                    # Docker 관련 파일들
├── docs/                      # 프로젝트 문서
└── scripts/                   # 빌드/배포 스크립트
```

## 🔧 기술 스택

### Backend
- **언어**: Kotlin
- **프레임워크**: Spring Boot 3.1.0
- **웹**: Spring WebFlux (Reactive)
- **HTTP 클라이언트**: WebClient
- **보안**: Spring Security
- **API 문서**: Swagger/OpenAPI 3

### Frontend  
- **언어**: TypeScript
- **프레임워크**: React 18
- **빌드 도구**: Vite
- **UI 라이브러리**: Ant Design
- **상태 관리**: Zustand
- **HTTP 클라이언트**: Axios
- **라우팅**: React Router

### OpenStack 연동
- **Keystone**: 인증 및 권한 관리
- **Nova**: 컴퓨트 서비스 (인스턴스 관리)
- **Glance**: 이미지 서비스

## 📈 현재 통계 (실제 데이터)

시스템에서 실시간으로 수집되는 데이터:
- **총 인스턴스**: 2개
- **실행 중인 인스턴스**: 1개 (ACTIVE 상태)
- **총 이미지**: 1개 (cirros-0.6.2-clean)
- **활성 이미지**: 1개
- **공개 이미지**: 1개

## 🔄 향후 개발 계획

### 🗃️ Volume 관리 (계획)
- [ ] 볼륨 목록 조회 및 관리
- [ ] 볼륨 생성/삭제/연결/해제
- [ ] 볼륨 스냅샷 관리
- [ ] 볼륨 타입 및 크기 관리

### 🌐 Network 관리 (계획)
- [ ] 네트워크 목록 조회 및 생성
- [ ] 서브넷 관리
- [ ] 라우터 관리
- [ ] 보안 그룹 관리
- [ ] 플로팅 IP 관리

### 🚀 인스턴스 고급 기능 (계획)
- [ ] 인스턴스에 볼륨 연결/해제 기능
- [ ] 인스턴스 배포 워크플로우
- [ ] 인스턴스 템플릿 관리
- [ ] 인스턴스 백업 및 스냅샷

### 📤 이미지 고급 기능 (계획)
- [ ] 이미지 업로드 기능
- [ ] 이미지 메타데이터 편집
- [ ] 커스텀 이미지 생성
- [ ] 이미지 공유 관리

## 🐋 Docker 배포(향후)

### 로컬 개발 환경 (Docker Compose)
```bash
# 전체 환경 실행
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:8080
# API Docs: http://localhost:8080/swagger-ui.html
```

### 개별 Docker 빌드
```bash
# Backend Docker 이미지 빌드
cd backend
docker build -f ../docker/Dockerfile.backend -t mini-cloud-backend .

# Frontend Docker 이미지 빌드
cd frontend
docker build -f ../docker/Dockerfile.frontend -t mini-cloud-frontend .
```

## ☸️ Kubernetes 배포(향후)

```bash
# Kubernetes 리소스 배포
kubectl apply -f k8s/

# 서비스 확인
kubectl get pods -n mini-cloud
kubectl get services -n mini-cloud
```

## 🔒 보안 고려사항

- 세션 기반 인증으로 토큰 관리
- CORS 설정으로 크로스 도메인 요청 제어
- OpenStack API 토큰 안전한 저장
- 프론트엔드에서 민감한 정보 노출 방지
- Spring Security를 통한 API 엔드포인트 보호

## 🐛 알려진 이슈

- 현재 개발/테스트 환경에서만 검증됨
- 프로덕션 환경을 위한 추가 보안 설정 필요
- 대용량 데이터 처리 최적화 필요
- WebSocket을 통한 실시간 업데이트 미구현

## 📚 문서
- [VM Spec 및 Openstack-helm 트러블 슈팅] (https://jaeki90.notion.site/Mini_cloud-206829282d1a80e39b91d2c12ef50a69?source=copy_link)
- [Backend API 문서](./docs/backend-api.md)
- [Frontend 컴포넌트 가이드](./docs/frontend-guide.md)
- [배포 가이드](./docs/deployment.md)
