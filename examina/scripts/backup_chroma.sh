#!/bin/bash

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/chroma"
BACKUP_PATH="$(pwd)/backups/chroma"

mkdir -p "$BACKUP_DIR"

docker run --rm \
  -v examina_chroma_data:/source:ro \
  -v "$BACKUP_PATH:/backup" \
  alpine \
  tar czf /backup/chroma_backup_${TIMESTAMP}.tar.gz -C /source .

echo "Backup created:"
echo "$BACKUP_DIR/chroma_backup_${TIMESTAMP}.tar.gz"
