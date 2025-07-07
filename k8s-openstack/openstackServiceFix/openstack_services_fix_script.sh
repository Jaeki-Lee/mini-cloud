#!/bin/bash

# OpenStack 서비스 간단 수정 스크립트
echo "🚀 OpenStack 서비스 간단 수정 시작"
echo "=============================================================="

# 백업 디렉토리 생성
mkdir -p backups
echo "📂 백업 디렉토리 생성: ./backups/"

# 서비스별 백업 및 수정
echo "🔧 서비스별 수정 시작"
echo "--------------------------------------------------------------"

# 1. Keystone
echo "=== keystone 서비스 수정 ==="
kubectl get svc keystone -n openstack -o yaml > backups/keystone-backup.yaml
kubectl patch svc keystone -n openstack -p '{
  "spec": {
    "selector": {
      "application": "keystone",
      "component": "api"
    },
    "ports": [
      {
        "name": "http",
        "port": 80,
        "targetPort": 5000,
        "protocol": "TCP"
      },
      {
        "name": "https",
        "port": 443,
        "targetPort": 5000,
        "protocol": "TCP"
      }
    ]
  }
}'
echo "✅ keystone 완료"

# 2. Cinder
echo "=== cinder 서비스 수정 ==="
kubectl get svc cinder -n openstack -o yaml > backups/cinder-backup.yaml
kubectl patch svc cinder -n openstack -p '{
  "spec": {
    "selector": {
      "application": "cinder",
      "component": "api"
    },
    "ports": [
      {
        "name": "http",
        "port": 80,
        "targetPort": 8776,
        "protocol": "TCP"
      },
      {
        "name": "https",
        "port": 443,
        "targetPort": 8776,
        "protocol": "TCP"
      }
    ]
  }
}'
echo "✅ cinder 완료"

# 3. Glance
echo "=== glance 서비스 수정 ==="
kubectl get svc glance -n openstack -o yaml > backups/glance-backup.yaml
kubectl patch svc glance -n openstack -p '{
  "spec": {
    "selector": {
      "application": "glance",
      "component": "api"
    },
    "ports": [
      {
        "name": "http",
        "port": 80,
        "targetPort": 9292,
        "protocol": "TCP"
      },
      {
        "name": "https",
        "port": 443,
        "targetPort": 9292,
        "protocol": "TCP"
      }
    ]
  }
}'
echo "✅ glance 완료"

# 4. Nova
echo "=== nova 서비스 수정 ==="
kubectl get svc nova -n openstack -o yaml > backups/nova-backup.yaml
kubectl patch svc nova -n openstack -p '{
  "spec": {
    "selector": {
      "application": "nova",
      "component": "os-api"
    },
    "ports": [
      {
        "name": "http",
        "port": 80,
        "targetPort": 8774,
        "protocol": "TCP"
      },
      {
        "name": "https",
        "port": 443,
        "targetPort": 8774,
        "protocol": "TCP"
      }
    ]
  }
}'
echo "✅ nova 완료"

# 5. Neutron
echo "=== neutron 서비스 수정 ==="
kubectl get svc neutron -n openstack -o yaml > backups/neutron-backup.yaml
kubectl patch svc neutron -n openstack -p '{
  "spec": {
    "selector": {
      "application": "neutron",
      "component": "server"
    },
    "ports": [
      {
        "name": "http",
        "port": 80,
        "targetPort": 9696,
        "protocol": "TCP"
      },
      {
        "name": "https",
        "port": 443,
        "targetPort": 9696,
        "protocol": "TCP"
      }
    ]
  }
}'
echo "✅ neutron 완료"

# 6. Heat
echo "=== heat 서비스 수정 ==="
kubectl get svc heat -n openstack -o yaml > backups/heat-backup.yaml
kubectl patch svc heat -n openstack -p '{
  "spec": {
    "selector": {
      "application": "heat",
      "component": "api"
    },
    "ports": [
      {
        "name": "http",
        "port": 80,
        "targetPort": 8004,
        "protocol": "TCP"
      },
      {
        "name": "https",
        "port": 443,
        "targetPort": 8004,
        "protocol": "TCP"
      }
    ]
  }
}'
echo "✅ heat 완료"

# 7. Horizon
echo "=== horizon 서비스 수정 ==="
kubectl get svc horizon -n openstack -o yaml > backups/horizon-backup.yaml
kubectl patch svc horizon -n openstack -p '{
  "spec": {
    "selector": {
      "application": "horizon",
      "component": "server"
    },
    "ports": [
      {
        "name": "http",
        "port": 80,
        "targetPort": 80,
        "protocol": "TCP"
      },
      {
        "name": "https",
        "port": 443,
        "targetPort": 80,
        "protocol": "TCP"
      }
    ]
  }
}'
echo "✅ horizon 완료"

# 8. Placement
echo "=== placement 서비스 수정 ==="
kubectl get svc placement -n openstack -o yaml > backups/placement-backup.yaml 2>/dev/null || echo "  placement 서비스 없음, 건너뛰기"
if kubectl get svc placement -n openstack >/dev/null 2>&1; then
    kubectl patch svc placement -n openstack -p '{
      "spec": {
        "selector": {
          "application": "placement",
          "component": "api"
        },
        "ports": [
          {
            "name": "http",
            "port": 80,
            "targetPort": 8778,
            "protocol": "TCP"
          },
          {
            "name": "https",
            "port": 443,
            "targetPort": 8778,
            "protocol": "TCP"
          }
        ]
      }
    }'
    echo "✅ placement 완료"
fi

echo ""
echo "📊 수정 결과 확인"
echo "--------------------------------------------------------------"

services=("keystone" "cinder" "glance" "nova" "neutron" "heat" "horizon" "placement")
for service in "${services[@]}"; do
    if kubectl get svc $service -n openstack >/dev/null 2>&1; then
        echo "=== $service 서비스 ==="
        echo "  Selector:"
        kubectl get svc $service -n openstack -o jsonpath='{.spec.selector}' | jq '.' 2>/dev/null || echo "    JSON 파싱 실패"
        echo "  Endpoints:"
        endpoints=$(kubectl get endpoints $service -n openstack -o jsonpath='{.subsets[0].addresses[*].ip}' 2>/dev/null)
        if [[ -n "$endpoints" ]]; then
            echo "    $endpoints"
        else
            echo "    엔드포인트 없음"
        fi
        echo ""
    fi
done

echo "🧪 OpenStack 클라이언트 테스트"
echo "--------------------------------------------------------------"

# 가상환경 활성화 확인
if [[ "$VIRTUAL_ENV" != *"openstack-client"* ]]; then
    echo "⚠️  가상환경을 활성화하세요: source ~/openstack-client/bin/activate"
else
    echo "🔑 토큰 발급 테스트:"
    if openstack --os-cloud openstack_helm token issue --format value --column id 2>/dev/null | head -c 20; then
        echo "... ✅ 성공!"
    else
        echo "❌ 실패"
    fi
fi

echo ""
echo "🔄 롤백 스크립트 생성"
echo "--------------------------------------------------------------"

cat > rollback.sh << 'EOF'
#!/bin/bash
echo "🔄 롤백 시작..."
services=("keystone" "cinder" "glance" "nova" "neutron" "heat" "horizon" "placement")
for svc in "${services[@]}"; do
    if [[ -f "backups/${svc}-backup.yaml" ]]; then
        echo "롤백 중: $svc"
        kubectl apply -f "backups/${svc}-backup.yaml"
    fi
done
echo "✅ 롤백 완료"
EOF

chmod +x rollback.sh
echo "✅ 롤백 스크립트 생성: ./rollback.sh"

echo ""
echo "=============================================================="
echo "🎉 OpenStack 서비스 수정 완료!"
echo "=============================================================="
echo ""
echo "📋 수정된 서비스: keystone, cinder, glance, nova, neutron, heat, horizon"
echo "💾 백업 위치: ./backups/"
echo "🔄 롤백 방법: ./rollback.sh"
echo ""
echo "🌐 이제 올바른 트래픽 플로우가 구현되었습니다:"
echo "  외부 → LoadBalancer → ingress-controller → Ingress 규칙 → API Pod ✅"
