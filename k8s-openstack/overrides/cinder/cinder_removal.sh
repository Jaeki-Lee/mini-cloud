#!/bin/bash

# 2단계: Cinder 서비스 완전 제거
# Master 노드에서 실행

echo "==============================================="
echo "2단계: Cinder 서비스 완전 제거"
echo "==============================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header "Cinder 서비스 상태 확인"

echo "현재 Cinder 관련 리소스들:"
echo ""
echo "=== Cinder Pods ==="
kubectl get pods -n openstack | grep cinder

echo ""
echo "=== Cinder Services ==="
kubectl get svc -n openstack | grep cinder

echo ""
echo "=== Cinder ConfigMaps ==="
kubectl get configmaps -n openstack | grep cinder

echo ""
echo "=== Cinder Secrets ==="
kubectl get secrets -n openstack | grep cinder

echo ""
echo "=== Cinder Jobs ==="
kubectl get jobs -n openstack | grep cinder

echo ""
read -p "Cinder 서비스를 완전히 제거하시겠습니까? (모든 블록 스토리지 데이터가 삭제됩니다) (y/N): " CONFIRM

if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Cinder 제거를 취소합니다."
    exit 0
fi

print_header "Cinder Helm Chart 제거"

echo "Cinder Helm Chart 제거 중..."
if helm list -n openstack | grep -q "^cinder"; then
    if helm uninstall cinder -n openstack --timeout=300s; then
        print_success "Cinder Helm Chart 제거 완료"
    else
        print_warning "Helm uninstall 실패 - 강제 제거 진행"
    fi
else
    print_warning "Cinder Helm Chart가 이미 제거되었거나 존재하지 않습니다"
fi

print_header "Cinder Pod 강제 제거"

echo "모든 Cinder Pod 강제 삭제 중..."

# 실행 중인 Cinder Pod들 강제 삭제
CINDER_PODS=($(kubectl get pods -n openstack --no-headers | grep cinder | awk '{print $1}'))

if [ ${#CINDER_PODS[@]} -gt 0 ]; then
    for pod in "${CINDER_PODS[@]}"; do
        echo "Pod 삭제 중: $pod"
        kubectl delete pod $pod -n openstack --force --grace-period=0
    done
    print_success "Cinder Pod들 삭제 완료"
else
    echo "삭제할 Cinder Pod가 없습니다"
fi

print_header "Cinder Job 및 CronJob 제거"

echo "Cinder 관련 Job들 삭제 중..."

# Cinder Job들 삭제
CINDER_JOBS=($(kubectl get jobs -n openstack --no-headers | grep cinder | awk '{print $1}'))

if [ ${#CINDER_JOBS[@]} -gt 0 ]; then
    for job in "${CINDER_JOBS[@]}"; do
        echo "Job 삭제 중: $job"
        kubectl delete job $job -n openstack --force --grace-period=0
    done
    print_success "Cinder Job들 삭제 완료"
else
    echo "삭제할 Cinder Job이 없습니다"
fi

# Cinder CronJob들 삭제
CINDER_CRONJOBS=($(kubectl get cronjobs -n openstack --no-headers | grep cinder | awk '{print $1}'))

if [ ${#CINDER_CRONJOBS[@]} -gt 0 ]; then
    for cronjob in "${CINDER_CRONJOBS[@]}"; do
        echo "CronJob 삭제 중: $cronjob"
        kubectl delete cronjob $cronjob -n openstack --force --grace-period=0
    done
    print_success "Cinder CronJob들 삭제 완료"
else
    echo "삭제할 Cinder CronJob이 없습니다"
fi

print_header "Cinder Service 및 Deployment 제거"

echo "Cinder Service들 삭제 중..."
kubectl delete svc -n openstack -l application=cinder --force --grace-period=0 2>/dev/null || true

echo "Cinder Deployment들 삭제 중..."
kubectl delete deployment -n openstack -l application=cinder --force --grace-period=0 2>/dev/null || true

echo "Cinder ReplicaSet들 삭제 중..."
kubectl delete replicaset -n openstack -l application=cinder --force --grace-period=0 2>/dev/null || true

print_success "Cinder Kubernetes 리소스 삭제 완료"

print_header "Cinder ConfigMap 및 Secret 제거"

echo "Cinder ConfigMap들 삭제 중..."
CINDER_CONFIGMAPS=($(kubectl get configmaps -n openstack --no-headers | grep cinder | awk '{print $1}'))

if [ ${#CINDER_CONFIGMAPS[@]} -gt 0 ]; then
    for cm in "${CINDER_CONFIGMAPS[@]}"; do
        echo "ConfigMap 삭제 중: $cm"
        kubectl delete configmap $cm -n openstack
    done
    print_success "Cinder ConfigMap들 삭제 완료"
else
    echo "삭제할 Cinder ConfigMap이 없습니다"
fi

echo ""
echo "Cinder Secret들 삭제 중..."
CINDER_SECRETS=($(kubectl get secrets -n openstack --no-headers | grep cinder | awk '{print $1}'))

if [ ${#CINDER_SECRETS[@]} -gt 0 ]; then
    for secret in "${CINDER_SECRETS[@]}"; do
        echo "Secret 삭제 중: $secret"
        kubectl delete secret $secret -n openstack
    done
    print_success "Cinder Secret들 삭제 완료"
else
    echo "삭제할 Cinder Secret이 없습니다"
fi

print_header "Cinder PVC 확인 및 제거"

echo "Cinder 관련 PVC 확인 중..."
CINDER_PVCS=($(kubectl get pvc -n openstack --no-headers 2>/dev/null | grep -i cinder | awk '{print $1}'))

if [ ${#CINDER_PVCS[@]} -gt 0 ]; then
    echo "발견된 Cinder PVC들:"
    for pvc in "${CINDER_PVCS[@]}"; do
        echo "- $pvc"
    done
    
    echo ""
    read -p "Cinder PVC들을 삭제하시겠습니까? (저장된 볼륨 데이터가 완전히 삭제됩니다) (y/N): " DELETE_PVC
    
    if [[ $DELETE_PVC =~ ^[Yy]$ ]]; then
        for pvc in "${CINDER_PVCS[@]}"; do
            echo "PVC 삭제 중: $pvc"
            kubectl delete pvc $pvc -n openstack --timeout=60s
            
            # 강제 삭제가 필요한 경우
            if kubectl get pvc $pvc -n openstack &>/dev/null; then
                echo "PVC $pvc 강제 삭제 시도..."
                kubectl patch pvc $pvc -n openstack -p '{"metadata":{"finalizers":null}}' 2>/dev/null || true
                kubectl delete pvc $pvc -n openstack --force --grace-period=0 2>/dev/null || true
            fi
        done
        print_success "Cinder PVC들 삭제 완료"
    else
        print_warning "Cinder PVC들은 유지됩니다"
    fi
else
    echo "Cinder 관련 PVC가 없습니다"
fi

print_header "Cinder 데이터베이스 정리"

echo "Keystone에서 Cinder 서비스 정보 확인..."
echo "참고: Cinder 서비스 정보는 다음에 Nova와 함께 재설치할 때 자동으로 재생성됩니다"

print_header "Cinder 제거 완료 확인"

echo "5초 후 상태 확인..."
sleep 5

echo ""
echo "=== 남은 Cinder 관련 리소스 확인 ==="

echo "남은 Cinder Pod들:"
kubectl get pods -n openstack | grep cinder || echo "Cinder Pod 없음"

echo ""
echo "남은 Cinder Service들:"
kubectl get svc -n openstack | grep cinder || echo "Cinder Service 없음"

echo ""
echo "남은 Cinder ConfigMap들:"
kubectl get configmaps -n openstack | grep cinder || echo "Cinder ConfigMap 없음"

echo ""
echo "남은 Cinder Secret들:"
kubectl get secrets -n openstack | grep cinder || echo "Cinder Secret 없음"

echo ""
echo "남은 Cinder PVC들:"
kubectl get pvc -n openstack | grep -i cinder || echo "Cinder PVC 없음"

echo ""
echo "현재 Helm Chart 목록:"
helm list -n openstack

print_header "Cinder 완전 제거 완료"

echo -e "${GREEN}✅ Cinder 서비스 완전 제거 완료!${NC}"
echo ""
echo "제거된 항목들:"
echo "- Cinder Helm Chart"
echo "- 모든 Cinder Pod, Service, Deployment"
echo "- Cinder ConfigMap 및 Secret"
echo "- Cinder Job 및 CronJob"
if [[ $DELETE_PVC =~ ^[Yy]$ ]]; then
    echo "- Cinder PVC (볼륨 데이터)"
fi

echo ""
echo -e "${YELLOW}📋 다음 단계:${NC}"
echo "1. 현재 배포된 서비스들 중 문제 있는 것들 해결"
echo "2. Nova 및 Libvirt 서비스 배포"
echo "3. Cinder 재설치 (필요시)"

echo ""
echo "Cinder 제거가 완료되었습니다. 다음 단계를 진행하세요!"
