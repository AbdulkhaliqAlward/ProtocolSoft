#!/bin/sh
# One-time preparation of a fresh Ubuntu server (22.04 / 24.04, x86_64 or ARM):
#   - Docker Engine + Compose plugin, from Docker's official apt repository
#   - a swap file when RAM is under 4 GB (building the two Next.js apps needs it)
#   - git and openssl
# Run as the default user (e.g. ubuntu):   sudo sh scripts/server/prepare-ubuntu.sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
  echo "Run with sudo: sudo sh scripts/server/prepare-ubuntu.sh" >&2
  exit 1
fi

echo "==> Base packages"
apt-get update -y
apt-get install -y ca-certificates curl gnupg git openssl

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Docker Engine (official repository)"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
fi

# Let the login user run docker without sudo (takes effect at next login).
TARGET_USER="${SUDO_USER:-ubuntu}"
if id "$TARGET_USER" >/dev/null 2>&1; then
  usermod -aG docker "$TARGET_USER"
fi

MEM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [ "$MEM_MB" -lt 4000 ] && ! swapon --show | grep -q '/swapfile'; then
  echo "==> RAM is ${MEM_MB} MB: adding a 4 GB swap file"
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

docker --version
docker compose version
echo "Done. Log out and back in (so '$TARGET_USER' can use docker without sudo), then continue with docs/DEPLOY.md."
