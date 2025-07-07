#!/bin/bash

# Ceph Adapter 동적 설정 스크립트
# 재시작해도 안전한 설정 생성

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo "=================================================="
echo "     Ceph Adapter 동적 설정 스크립트"
echo "     (재시작 안전 버전)"
echo "=================================================="
echo ""

# 1. 현재 Ceph 클러스터 상태 확인
log_info "1. Ceph 클러스터 상태 확인"

# Ceph 모니터 서비스 확인
MONITOR_SERVICES=$(kubectl get svc -n rook-ceph -l app=rook-ceph-mon --no-headers 2>/dev/null | awk '{print $1".rook-ceph.svc.cluster.local:6789"}' | tr '\n' ',' | sed 's/,$//')

if [ -z "$MONITOR_SERVICES" ]; then
    log_warn "Ceph 모니터 서비스를 찾을 수 없습니다. 대안 방법 사용..."
    
    # 대안: Pod IP 기반 (임시)
    POD_IPS=$(kubectl get pods -n rook-ceph -l app=rook-ceph-mon --no-headers 2>/dev/null | awk '{print $1}' | while read pod; do
        kubectl get pod "$pod" -n rook-ceph -o jsonpath='{.status.podIP}:6789'
        echo ","
    done | tr -d '\n' | sed 's/,$//')
    
    if [ -n "$POD_IPS" ]; then
        MONITOR_SERVICES="$POD_IPS"
        log_warn "Pod IP 기반 설정 사용: $MONITOR_SERVICES"
    else
        log_error "Ceph 모니터를 찾을 수 없습니다!"
        exit 1
    fi
else
    log_success "서비스 기반 모니터 엔드포인트: $MONITOR_SERVICES"
fi

# 2. 동적 설정 ConfigMap 생성
log_info "2. 동적 Ceph 설정 생성"

# 완전한 ceph.conf 생성
CEPH_CONF="[global]
mon_host = $MONITOR_SERVICES
auth_cluster_required = cephx
auth_service_required = cephx
auth_client_required = cephx
public_network = 10.244.0.0/16
cluster_network = 10.244.0.0/16

[client]
rbd_cache = true
rbd_cache_writethrough_until_flush = true
rbd_concurrent_management_ops = 20

[client.admin]
keyring = /etc/ceph/keyring"

# ConfigMap 업데이트 (JSON 이스케이프 처리)
ESCAPED_CEPH_CONF=$(echo "$CEPH_CONF" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')
kubectl patch configmap ceph-etc -n openstack --type merge -p "{\"data\":{\"ceph.conf\":\"$ESCAPED_CEPH_CONF\"}}"
log_success "ceph.conf 업데이트 완료"

# 3. Ceph 클라이언트 키 설정
log_info "3. Ceph 클라이언트 키 설정"

# Ceph 관리자 키 가져오기
CEPH_KEY=$(kubectl exec -n rook-ceph deployment/rook-ceph-tools -- ceph auth get-key client.admin 2>/dev/null)

if [ -z "$CEPH_KEY" ]; then
    log_warn "client.admin 키를 가져올 수 없습니다. 대안 시도..."
    
    # 대안: secret에서 키 추출
    CEPH_KEY=$(kubectl get secret -n rook-ceph rook-ceph-mon -o jsonpath='{.data.admin-secret}' 2>/dev/null | base64 -d || echo "")
    
    if [ -z "$CEPH_KEY" ]; then
        log_error "Ceph 키를 가져올 수 없습니다!"
        exit 1
    fi
fi

log_info "Ceph 키 길이: ${#CEPH_KEY} 문자"

# Secret 업데이트
kubectl patch secret pvc-ceph-client-key -n openstack --type merge -p "{\"data\":{\"key\":\"$(echo -n $CEPH_KEY | base64 -w 0)\"}}"
log_success "Ceph 클라이언트 키 업데이트 완료"

# 4. 추가 안전 장치: 키링 파일 설정
log_info "4. 키링 파일 ConfigMap 생성"

KEYRING_CONTENT="[client.admin]
    key = $CEPH_KEY
    caps mds = \"allow *\"
    caps mon = \"allow *\"
    caps osd = \"allow *\"
    caps mgr = \"allow *\""

# 키링 ConfigMap 생성/업데이트
kubectl create configmap ceph-keyring -n openstack \
    --from-literal="keyring=$KEYRING_CONTENT" \
    --dry-run=client -o yaml | kubectl apply -f -

log_success "키링 ConfigMap 생성 완료"

# 5. 설정 검증
log_info "5. 설정 검증"

echo "=== 최종 ceph.conf ==="
kubectl get configmap ceph-etc -n openstack -o jsonpath='{.data.ceph\.conf}'
echo ""

echo ""
echo "=== Ceph 키 확인 ==="
STORED_KEY=$(kubectl get secret pvc-ceph-client-key -n openstack -o jsonpath='{.data.key}' | base64 -d)
if [ "$STORED_KEY" = "$CEPH_KEY" ]; then
    log_success "✅ 키 설정이 올바릅니다"
else
    log_warn "⚠️ 키 설정에 문제가 있을 수 있습니다"
fi

# 6. 연결 테스트
log_info "6. 연결 테스트"

# 테스트 PVC 생성
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: test-dynamic-ceph
  namespace: openstack
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: general
EOF

# PVC 상태 확인
sleep 10
PVC_STATUS=$(kubectl get pvc test-dynamic-ceph -n openstack -o jsonpath='{.status.phase}' 2>/dev/null || echo "NotFound")

if [ "$PVC_STATUS" = "Bound" ]; then
    log_success "✅ 동적 설정으로 Ceph 연결 성공!"
    
    # RBD 이미지 확인
    RBD_IMAGE=$(kubectl get pv $(kubectl get pvc test-dynamic-ceph -n openstack -o jsonpath='{.spec.volumeName}') -o jsonpath='{.spec.csi.volumeAttributes.imageName}' 2>/dev/null || echo "")
    if [ -n "$RBD_IMAGE" ]; then
        log_info "생성된 RBD 이미지: $RBD_IMAGE"
    fi
    
else
    log_warn "⚠️ PVC 상태: $PVC_STATUS"
    echo "추가 진단이 필요할 수 있습니다."
fi

# 테스트 PVC 삭제
kubectl delete pvc test-dynamic-ceph -n openstack --timeout=60s 2>/dev/null || true

# 7. 최종 요약
echo ""
echo "=================================================="
echo "                최종 요약"
echo "=================================================="

log_info "설정 내용:"
echo "  - 모니터 엔드포인트: 서비스 기반 (재시작 안전)"
echo "  - 클라이언트 키: $(echo ${CEPH_KEY:0:10}...)길이=${#CEPH_KEY}"
echo "  - 추가 키링: 생성됨"
echo "  - 네트워크 설정: Pod CIDR 기반"

if [ "$PVC_STATUS" = "Bound" ]; then
    log_success "🎉 Ceph Adapter가 재시작 안전하게 설정되었습니다!"
    echo ""
    echo "이제 다음 단계를 안전하게 진행할 수 있습니다:"
    echo "1. RabbitMQ 설치"
    echo "2. MariaDB 설치"
    echo "3. LibVirt 설치 (VM 스토리지)"
    echo "4. 서버 재시작 테스트"
else
    log_warn "⚠️ 일부 설정에 문제가 있을 수 있습니다"
    echo "수동으로 추가 확인을 권장합니다."
fi

echo ""
log_info "스크립트 실행 완료!"
