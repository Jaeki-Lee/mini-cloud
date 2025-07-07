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
