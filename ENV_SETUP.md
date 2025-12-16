# Environment Setup Guide - Pentru Colegii de Echipă

**IMPORTANT**: Acest ghid te ajută să configurezi mediul local fără a expune credențialele în Git.

---

## 🚀 Setup Rapid (3 pași)

### Pasul 1: Rulează scriptul de setup
```bash
./setup-env.sh
```

Acest script va crea automat toate fișierele `.env` din `.env.example`.

---

### Pasul 2: Adaugă credențialele

Deschide fișierul `.env` din root și completează:

```env
# Supabase (necesare pentru toate serviciile)
SUPABASE_URL=https://zxroairquswwhxsccfvh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cm9haXJxdXN3d2h4c2NjZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ5MDYsImV4cCI6MjA3OTU2MDkwNn0.mEZdJYwG0RiSU2kXuF7OJIjLP4aJdjN2C4GdmunfKh8

# OpenWeatherMap (necesar pentru Weather Service)
OPENWEATHER_API_KEY=b85318feeb3622c40d9337e76ed0a3af
```

**Notă**: Credențialele de mai sus sunt pentru proiectul TripMate IMS 2025.

---

### Pasul 3: Start servicii
```bash
docker compose up -d --build
```

Verifică că toate serviciile sunt pornite:
```bash
curl http://localhost:3000/health | jq .
```

---

## 📋 Setup Manual (dacă scriptul nu funcționează)

### 1. Root .env
```bash
cp .env.docker.example .env
```

Editează `.env` și adaugă credențialele de mai sus.

### 2. Service .env files (opțional)
Fișierele `.env` din servicii nu sunt necesare dacă folosești Docker Compose (variabilele sunt injectate din root `.env`).

Dar dacă vrei să rulezi serviciile individual:

```bash
# Pentru fiecare serviciu
cd services/api-gateway && cp .env.example .env
cd services/trip-service && cp .env.example .env
cd services/itinerary-service && cp .env.example .env
cd services/budget-service && cp .env.example .env
cd services/weather-service && cp .env.example .env
cd services/places-service && cp .env.example .env
cd services/currency-service && cp .env.example .env
```

Apoi editează fiecare `.env` și adaugă credențialele Supabase + OpenWeatherMap.

---

## 🔐 Credențiale Proiect (IMS 2025)

### Supabase
- **URL**: `https://zxroairquswwhxsccfvh.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4cm9haXJxdXN3d2h4c2NjZnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODQ5MDYsImV4cCI6MjA3OTU2MDkwNn0.mEZdJYwG0RiSU2kXuF7OJIjLP4aJdjN2C4GdmunfKh8`

### OpenWeatherMap
- **API Key**: `b85318feeb3622c40d9337e76ed0a3af`
- **Tier**: Free (60 calls/min)

**Notă**: Aceste credențiale sunt pentru proiectul de facultate și au fost expuse intenționat pentru colaborare în echipă.

---

## ✅ Verificare Setup

### 1. Check .env files
```bash
# Root .env trebuie să existe
ls -la .env

# Ar trebui să conțină credențialele
grep SUPABASE_URL .env
grep OPENWEATHER_API_KEY .env
```

### 2. Start Docker Compose
```bash
docker compose up -d
```

### 3. Verifică serviciile
```bash
# Toate serviciile ar trebui să fie healthy
docker compose ps

# Health check agregat
curl http://localhost:3000/health
```

Expected output:
```json
{
  "status": "healthy",
  "summary": {
    "total": 6,
    "healthy": 6,
    "unhealthy": 0
  }
}
```

---

## 🐛 Troubleshooting

### Eroare: "SUPABASE_URL is not defined"
**Soluție**:
```bash
# Verifică că .env există
cat .env

# Recreează din template
cp .env.docker.example .env
# Editează și adaugă credențialele
```

### Eroare: "Cannot connect to Supabase"
**Soluție**: Verifică că URL-ul și key-ul sunt corecte în `.env`

### Services nu pornesc
**Soluție**:
```bash
# Rebuild complet
docker compose down -v
docker compose up --build -d

# Check logs
docker compose logs -f
```

---

## 📚 Documentație Suplimentară

- **QUICKSTART.md**: Setup complet în 5 minute
- **DOCKER_DEPLOYMENT.md**: Ghid deployment detaliat
- **README.md**: Overview proiect

---

## 🤝 Colaborare în Echipă

### Pentru rulare locală:
1. Clone repository: `git clone <repo>`
2. Run setup script: `./setup-env.sh`
3. Editează `.env` cu credențialele de mai sus
4. Start services: `docker compose up -d`

### Pentru dezvoltare:
- Nu commit-a niciodată fișierele `.env` (sunt în .gitignore)
- Dacă modifici `.env.example`, commit-uiește-l
- Dacă adaugi variabile noi, documentează-le în acest fișier

---

**Ultima actualizare**: 2025-12-16
**Credențiale valide pentru**: Proiect IMS 2025 - TripMate
