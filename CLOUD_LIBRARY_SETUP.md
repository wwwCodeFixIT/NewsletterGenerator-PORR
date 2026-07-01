# Wspólna biblioteka projektów — Cloudflare D1

Ta wersja generatora ma API `/api/projects` oparte o Cloudflare Pages Functions + D1. Dzięki temu projekty i szablony mogą być wspólne dla wszystkich osób otwierających ten sam link.

## 1. Instalacja lokalna

```bash
npm install
npm run typecheck
npm run build
```

## 2. Utworzenie bazy D1

```bash
npx wrangler login
npm run db:create
```

Cloudflare zwróci `database_id`. Wklej go do `wrangler.jsonc` w miejscu:

```jsonc
"database_id": "REPLACE_WITH_D1_DATABASE_ID"
```

## 3. Migracje bazy

Lokalnie:

```bash
npm run db:migrate:local
```

Produkcyjnie:

```bash
npm run db:migrate:remote
```

## 4. Token administratora

W Cloudflare Pages dodaj zmienną środowiskową:

```txt
ADMIN_TOKEN=twoj-pin-lub-dlugi-token
```

Jeżeli `ADMIN_TOKEN` jest ustawiony, zapis/usuwanie projektów wymaga podania tego tokena w modalu aplikacji.

Lokalnie możesz skopiować:

```bash
cp .dev.vars.example .dev.vars
```

i zmienić wartość tokena.

## 5. Local preview z API

```bash
npm run cf:dev
```

To uruchamia build Vite oraz Cloudflare Pages Functions lokalnie.

## 6. Deploy

Na Cloudflare Pages ustaw:

```txt
Build command: npm run build
Build output directory: dist
```

Po deployu w Cloudflare Pages podłącz D1 binding:

```txt
Binding name: DB
Database: porr-newsletter-generator
```

## Co zostało dodane

- `functions/api/projects/index.ts` — lista i zapis/upsert projektów.
- `functions/api/projects/[id].ts` — odczyt, aktualizacja i usuwanie projektu.
- `functions/api/projects/[id]/versions.ts` — historia wersji.
- `migrations/0001_projects.sql` — schema bazy.
- `src/utils/remoteLibrary.ts` — klient API po stronie React.
- `src/components/Modals/LibraryModal.tsx` — wspólna biblioteka.
- `src/components/Modals/SaveToLibraryModal.tsx` — zapis do biblioteki.

## Uwaga o obrazach

Jeśli projekt zawiera duże lokalne obrazy jako `data:image/...`, zapis do D1 może być ciężki. Docelowo najlepszy etap 2 to przenieść obrazy do Cloudflare R2, a w D1 zapisywać tylko URL-e.
