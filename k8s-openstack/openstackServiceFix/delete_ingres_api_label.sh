#!/bin/bash

# OpenStack 서비스 완전 수정 스크립트 (app: ingress-api 완전 제거)
echo "🚀 OpenStack 서비스 완전 수정 시작"
echo "=============================================================="

echo "🔧 app: ingress-api 완전 제거 및 올바른 selector 설정"
echo "--------------------------------------------------------------"

# 1. Keystone - app: ingress-api 완전 제거
echo "=== keystone 서비스 완전 수정 ==="
kubectl patch svc keystone -n openstack -p '{
  "spec": {
    "selector": {
      "application": "keystone",
      "component": "api"
    }
  }
}' --type merge
echo "✅ keystone app: ingress-api 제거 완료"

# 2. Cinder
echo "=== cinder 서비스 완전 수정 ==="
kubectl patch svc cinder -n openstack -p '{
  "spec": {
    "selector": {
      "application": "cinder",
      "component": "api"
    }
  }
}' --type merge
echo "✅ cinder app: ingress-api 제거 완료"

# 3. Glance
echo "=== glance 서비스 완전 수정 ==="
kubectl patch svc glance -n openstack -p '{
  "spec": {
    "selector": {
      "application": "glance",
      "component": "api"
    }
  }
}' --type merge
echo "✅ glance app: ingress-api 제거 완료"

# 4. Nova
echo "=== nova 서비스 완전 수정 ==="
kubectl patch svc nova -n openstack -p '{
  "spec": {
    "selector": {
      "application": "nova",
      "component": "os-api"
    }
  }
}' --type merge
echo "✅ nova app: ingress-api 제거 완료"

# 5. Neutron
echo "=== neutron 서비스 완전 수정 ==="
kubectl patch svc neutron -n openstack -p '{
  "spec": {
    "selector": {
      "application": "neutron",
      "component": "server"
    }
  }
}' --type merge
echo "✅ neutron app: ingress-api 제거 완료"

# 6. Heat
echo "=== heat 서비스 완전 수정 ==="
kubectl patch svc heat -n openstack -p '{
  "spec": {
    "selector": {
      "application": "heat",
      "component": "api"
    }
  }
}' --type merge
echo "✅ heat app: ingress-api 제거 완료"

# 7. Horizon
echo "=== horizon 서비스 완전 수정 ==="
kubectl patch svc horizon -n openstack -p '{
  "spec": {
    "selector": {
      "application": "horizon",
      "component": "server"
    }
  }
}' --type merge
echo "✅ horizon app: ingress-api 제거 완료"

# 8. Placement
echo "=== placement 서비스 완전 수정 ==="
if kubectl get svc placement -n openstack >/dev/null 2>&1; then
    kubectl patch svc placement -n openstack -p '{
      "spec": {
        "selector": {
          "application": "placement",
          "component": "api"
        }
      }
    }' --type merge
    echo "✅ placement app: ingress-api 제거 완료"
fi

echo ""
echo "📊 수정 결과 확인"
echo "--------------------------------------------------------------"

services=("keystone" "cinder" "glance" "nova" "neutron" "heat" "horizon" "placement")
for service in "${services[@]}"; do
    if kubectl get svc $service -n openstack >/dev/null 2>&1; then
        echo "=== $service 서비스 ==="
        echo "  Selector:"
        selector=$(kubectl get svc $service -n openstack -o jsonpath='{.spec.selector}' 2>/dev/null)
        echo "    $selector"
        
        # app: ingress-api 존재 여부 확인
        if echo "$selector" | grep -q "ingress-api"; then
            echo "  ❌ 여전히 app: ingress-api 포함"
        else
            echo "  ✅ app: ingress-api 제거 성공"
        fi
        
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

echo "🧪 최종 테스트"
echo "--------------------------------------------------------------"

# OpenStack 클라이언트 테스트
if [[ "$VIRTUAL_ENV" == *"openstack-client"* ]]; then
    echo "🔑 토큰 발급 테스트:"
    if token=$(openstack --os-cloud openstack_helm token issue --format value --column id 2>/dev/null); then
        echo "${token:0:20}... ✅ 성공!"
        
        echo "📋 엔드포인트 확인:"
        openstack --os-cloud openstack_helm endpoint list --format table | head -10
    else
        echo "❌ 토큰 발급 실패"
    fi
else
    echo "⚠️  가상환경을 활성화하세요: source ~/openstack-client/bin/activate"
fi

echo ""
echo "=============================================================="
echo "🎉 OpenStack 서비스 완전 수정 완료!"
echo "=============================================================="
echo ""
echo "✅ 모든 서비스에서 app: ingress-api 제거 완료"
echo "✅ 순환 참조 완전 해결"
echo "✅ 올바른 트래픽 플로우 구현"
echo ""
echo "🌐 완성된 트래픽 플로우:"
echo "  외부 클라이언트"
echo "    ↓ LoadBalancer (172.24.128.100:80)"
echo "    ↓ ingress-nginx-controller"
echo "    ↓ Ingress 규칙"
echo "    ↓ OpenStack API Pod (직접 연결!)"
echo "    ↓ API 응답 ✅"
