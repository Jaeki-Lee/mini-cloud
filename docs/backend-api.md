# Backend API 문서

## 인증 API

### POST /api/auth/login
로그인

### POST /api/auth/logout  
로그아웃

## 프록시 API

### Nova (컴퓨팅)
- GET /api/proxy/nova/v2.1/servers - 인스턴스 목록
- POST /api/proxy/nova/v2.1/servers - 인스턴스 생성

### Neutron (네트워킹)
- GET /api/proxy/neutron/v2.0/networks - 네트워크 목록

### Cinder (볼륨)
- GET /api/proxy/cinder/v3/volumes - 볼륨 목록

### Glance (이미지)
- GET /api/proxy/glance/v2/images - 이미지 목록
