#!/usr/bin/env bash
# 로컬 Supabase 스택을 띄운다. Docker 데몬이 없으면 먼저 시작한다.
set -euo pipefail

if ! docker info >/dev/null 2>&1; then
  echo "Docker 데몬을 시작합니다..."
  dockerd >/tmp/dockerd.log 2>&1 &
  for _ in $(seq 1 60); do
    docker info >/dev/null 2>&1 && break
    sleep 1
  done
  docker info >/dev/null 2>&1 || { echo "Docker 데몬 시작 실패 (/tmp/dockerd.log 확인)" >&2; exit 1; }
fi

SUPABASE_INTERNAL_IMAGE_REGISTRY=docker.io npx supabase start \
  -x imgproxy,vector,logflare,supavisor,postgres-meta,studio,edge-runtime
