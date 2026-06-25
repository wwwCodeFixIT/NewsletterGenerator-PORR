# Generator Newslettera PORR

Aplikacja webowa (React + TypeScript + Vite) do tworzenia, stylowania i
eksportowania firmowych newsletterów PORR jako gotowych do wysyłki plików
HTML / EML / MHT, kompatybilnych z różnymi wersjami Outlooka. Działa w 100%
w przeglądarce — bez backendu, bez konta, bez wysyłania treści gdziekolwiek.

## Szybki start

```bash
npm install
npm run dev
```

## Co tu jest

- **Treść** — nagłówek, artykuł główny, sekcja wideo, stopka.
- **Artykuły** — dowolna liczba artykułów z możliwością zmiany kolejności,
  duplikowania i edycji inline.
- **Feedback** — konfigurowalna sekcja oceny newslettera (emoji / gwiazdki /
  kciuki) z linkiem do pełnej ankiety.
- **Styl** — kolory, czcionka (bezpieczna dla Outlooka), gotowe schematy
  kolorystyczne, włączanie/wyłączanie sekcji.
- **Eksport** — licznik kompatybilności z Outlookiem, eksport do:
  - `.EML` (standard / „Outlook Safe” — bez zewnętrznych obrazów, lokalne
    obrazy osadzone jako CID),
  - `.EML draft` (do edycji w klasycznym Outlooku przed wysyłką),
  - `.MHT`, `.HTML`, kopiowanie do schowka (np. pod „Moje szablony” w nowym
    Outlooku) oraz eksport/import całego projektu jako `.json`.

Projekt zapisuje się automatycznie w `localStorage` przeglądarki (z listą
ostatnich projektów). Skróty klawiszowe: `Ctrl+S` zapisz, `Ctrl+E` eksport
HTML, `Ctrl+P` podgląd w nowej karcie, `Ctrl+N` nowy projekt.

## Struktura

```
src/
  App.tsx                  — główny komponent, stan modali, skróty klawiszowe
  components/
    TopBar.tsx, Preview.tsx, Notifications.tsx
    Sidebar.tsx             — orchestrator zakładek panelu bocznego
    Sidebar/                — poszczególne zakładki (Content/Articles/
                              Feedback/Style/Export) + wspólne pola formularzy
    Modals/                 — pomoc, podgląd kodu, szablony, instrukcja Outlook
  hooks/useNewsletterStore.ts — cały stan newslettera + auto-save
  utils/emailGenerator.ts     — generator HTML (tabele, VML, MSO conditionals)
  utils/emlGenerator.ts       — generator pliku .EML (CID, base64, drafty)
```

## Komendy

```bash
npm run dev      # serwer deweloperski Vite
npm run build    # tsc -b && vite build — produkcyjny bundle do dist/
npm run lint     # eslint .
npm run preview  # podgląd zbudowanej wersji produkcyjnej
```

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4 — bez backendu i bez zależności
runtime poza React/ReactDOM, clsx i tailwind-merge.

## Uwaga dot. historii repozytorium

W tym repozytorium leżał wcześniej również drugi, niezależny projekt — czat
RAG do dokumentacji PORR („Korpus”, `src/app/`, `src/features/`). Nie był on
podłączony jako aktywna aplikacja (entry point wskazywał właśnie na niego, a
Generator Newslettera był odłączony) i pozostaje na miejscu nietknięty, ale
poza ścieżką budowania UI tego projektu. Opis tamtego projektu znajduje się
w `README-korpus-chat-archiwum.md` oraz `kontrakt-api.md`.
