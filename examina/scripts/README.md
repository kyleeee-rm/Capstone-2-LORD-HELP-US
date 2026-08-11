# Infrastructure Utilities

## ChromaDB Backup Strategy

### Purpose

ChromaDB stores vector embeddings and collection metadata inside the Docker volume:

```text
examina_chroma_data
```

To prevent data loss, backups can be created by archiving the entire volume.

---

### Create a Backup

Run:

```bash
./scripts/backup_chroma.sh
```

Example output:

```text
Backup created:
./backups/chroma/chroma_backup_20260810_175103.tar.gz
```

---

### Backup Location

Backups are stored in:

```text
backups/chroma/
```

Example:

```text
backups/chroma/chroma_backup_20260810_175103.tar.gz
```

Each backup contains:

- ChromaDB SQLite metadata database (`chroma.sqlite3`)
- Vector index files
- Collection data
- Embedding storage files

---

### Verify a Backup

List archive contents:

```bash
tar -tzf backups/chroma/<backup_file>.tar.gz
```

Example:

```bash
tar -tzf backups/chroma/chroma_backup_20260810_175103.tar.gz
```

---

### Restore a Backup

Stop the containers:

```bash
docker compose down
```

Restore the backup archive into the ChromaDB volume:

```bash
docker run --rm \
  -v examina_chroma_data:/target \
  -v $(pwd)/backups/chroma:/backup \
  alpine \
  sh -c "rm -rf /target/* && tar xzf /backup/<backup_file>.tar.gz -C /target"
```

Start the containers again:

```bash
docker compose up -d
```

---

## Seed Data

### Purpose

Provides sample data for development and testing without requiring manual creation through the UI.

The seed script creates:

- 1 Faculty account
- 2 Sample subjects
- Subject folders for each subject:
  - Week 1
  - Week 2
  - Week 3
  - Exams

---

### Run Seed Script

```bash
docker compose exec backend python -m app.scripts.seed_data
```

Example output:

```text
Seed data created successfully.
```

If the data already exists:

```text
Seed faculty already exists. Skipping seed data creation.
```

The seed script is idempotent and can be run multiple times safely. If the seed faculty account already exists, no duplicate data will be created.

---

### Seed Credentials

```text
Email: seed@examina.local
Password: Password123!
```

---

## Notes

Persistent ChromaDB storage is provided through the Docker volume:

```text
examina_chroma_data
```

Verified by:

- Docker volume inspection
- Existing ChromaDB collections and index files stored under `/chroma/chroma`
- Data persistence across container restarts
