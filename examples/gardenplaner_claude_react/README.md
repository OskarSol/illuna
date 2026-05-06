# Gartenplaner – Claude React App

Ein KI-gestützter Gartenplaner auf Basis von React, TypeScript, Vite und einem Express-Backend mit Claude als KI-Engine.

## Voraussetzungen

- [Node.js](https://nodejs.org/) v18 oder neuer
- npm (wird mit Node.js mitgeliefert)
- Einen Anthropic API-Key (für Claude)

## 1. Umgebungsvariablen konfigurieren

Kopiere `.env.example` zu `.env` und passe die Werte an:

```bash
cp .env.example .env
```

Anschließend `.env` öffnen und befüllen:

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `APP_ENCRYPTION_KEY` | Ja | 64 Hex-Zeichen (32 Byte) – verschlüsselt sensible Einstellungen wie den API-Key |
| `PORT` | Nein | Port des Backend-Servers (Standard: `3001`) |
| `JWT_SECRET` | Empfohlen | Geheimnis für JWT-Tokens; in Produktion zwingend setzen |

### Encryption Key generieren

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Den ausgegebenen Wert als `APP_ENCRYPTION_KEY` eintragen.

### Beispiel `.env`

```env
APP_ENCRYPTION_KEY=a1b2c3d4e5f6...  # 64 Hex-Zeichen
JWT_SECRET=mein-sicheres-geheimnis
# PORT=3001
```

## 2. Abhängigkeiten installieren

```bash
npm install
```

## 3. App starten

### Entwicklungsmodus (Frontend + Backend gleichzeitig)

```bash
npm run dev
```

Startet den Express-API-Server (`tsx watch`) und den Vite-Dev-Server parallel.

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend-API: [http://localhost:3001](http://localhost:3001)

### Produktion: Build erstellen

```bash
npm run build
```

Kompiliert TypeScript und erstellt den optimierten Frontend-Build unter `dist/`.

### Produktion: Server starten

```bash
npm start
```

Startet nur den Express-Server, der auch die gebauten Frontend-Dateien ausliefert.

## Weitere Skripte

| Befehl | Beschreibung |
|---|---|
| `npm run server:dev` | Nur den API-Server starten (ohne Frontend) |
| `npm run client:dev` | Nur den Vite-Dev-Server starten |
| `npm run lint` | ESLint ausführen |
| `npm run preview` | Gebautes Frontend lokal vorschauen |
