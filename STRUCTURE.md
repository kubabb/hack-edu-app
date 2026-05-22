# Architektura i Funkcjonalności Aplikacji TutorAI

Niniejszy dokument przedstawia szczegółową strukturę projektu oraz zestawienie zaimplementowanych do tej pory funkcjonalności w aplikacji **TutorAI**.

---

## 1. Architektura i Struktura Projektu

Aplikacja została zbudowana przy użyciu frameworka **Next.js 14+ (App Router)** z bazą danych **PostgreSQL** (zarządzaną przez ORM **Prisma**) oraz autoryzacją za pomocą **Supabase Auth** zintegrowaną z dedykowaną warstwą kompatybilności dla NextAuth.

### Główne Katalogi

*   **[`app/`](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/app)** – Punkty wejścia stron aplikacji (App Router), formularze autoryzacyjne, sekcje strony głównej oraz endpointy API backendu.
*   **[`prisma/`](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/prisma)** – Plik schematu bazy danych [schema.prisma](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/prisma/schema.prisma) definiujący modele dla użytkowników, książek, stron, fragmentów (chunków), embeddingów, grafu i czatów.
*   **[`src/components/`](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/components)** – Komponenty interfejsu użytkownika (np. czat, graf wiedzy, formularz przesyłania plików, odtwarzacz wideo).
*   **[`src/hooks/`](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/hooks)** – Niestandardowe haki Reacta (np. pobieranie i subskrypcja stanu użytkownika).
*   **[`src/lib/`](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/lib)** – Współdzielone konfiguracje bibliotek klienckich/serwerowych (np. klient Supabase).
*   **[`src/server/`](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server)** – Backendowa logika aplikacji rozdzielona na warstwy:
    *   `adapters/` – Integracje i komunikacja z usługami zewnętrznymi (OpenAI, OCR, HeyGen).
    *   `repositories/` – Klasy odpowiedzialne za operacje bazodanowe na modelach Prisma.
    *   `services/` – Klasy implementujące logikę biznesową procesów systemowych.

---

## 2. Zaimplementowane Funkcjonalności

### A. Autoryzacja i Zarządzanie Użytkownikami
*   **Rejestracja i Logowanie**: Strony [login/page.tsx](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/app/auth/login/page.tsx) oraz [register/page.tsx](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/app/auth/register/page.tsx) oparte o Supabase Auth.
*   **Kompatybilność Sesji (Compat Layer)**: Plik [auth.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/auth.ts) mapuje sesję Supabase bezpośrednio na strukturę użytkownika w lokalnej bazie PostgreSQL, a plik [middleware.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/middleware.ts) automatycznie odświeża sesje serwerowe.
*   **Synchronizacja Kont**: Endpoint `/api/auth/register` (w pliku [route.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/app/api/auth/register/route.ts)) tworzy rekord użytkownika w lokalnej bazie danych po pomyślnej rejestracji w Supabase.

### B. Przetwarzanie i Ingestia Książek (PDF / Obrazy)
*   **Wgrywanie Plików**: Komponent [UploadBookForm.tsx](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/components/UploadBookForm.tsx) obsługuje przeciąganie plików. Pliki są wysyłane na endpoint `/api/books` ([route.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/app/api/books/route.ts)) i tymczasowo zapisywane w `tmp/uploads`.
*   **Ekstrakcja Tekstu (OCR)**: Zaimplementowana w [BookIngestionService.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/services/BookIngestionService.ts) za pomocą adaptera [MathpixOcrAdapter.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/adapters/MathpixOcrAdapter.ts). *(Uwaga: aktualnie rzuca wyjątek TODO do pełnego wdrożenia).*
*   **Segmentacja Tekstu (Chunking)**: Usługa [BookChunkingService.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/services/BookChunkingService.ts) dzieli tekst z poszczególnych stron na fragmenty (chunki) na podstawie wykrytych słów kluczowych: zadania (`TASK`), przykłady (`EXAMPLE`), teoria (`THEORY`) oraz inne (`OTHER`).
*   **Generowanie Embeddingów**: Moduł [EmbeddingService.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/services/EmbeddingService.ts) pobiera wektory za pomocą modelu `text-embedding-ada-002` przez adapter [OpenAIEmbeddingAdapter.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/adapters/OpenAIEmbeddingAdapter.ts) i zapisuje je w bazie danych.

### C. Budowanie i Przechowywanie Grafu Wiedzy
*   **Generowanie Węzłów**: Klasa [GraphBuilderService.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/services/GraphBuilderService.ts) automatycznie tworzy węzły w bazie danych na podstawie wygenerowanych fragmentów tekstu.
*   **Łączenie Krawędzi**:
    *   **Krawędzie `NEXT`**: Łączą sekwencyjnie kolejne fragmenty tekstu książki.
    *   **Krawędzie `SIMILAR`**: Powstają automatycznie, gdy podobieństwo cosinusowe wektorów dwóch chunków przekracza wartość progową `0.8`.

### D. Interaktywna Wizualizacja (Frontend)
*   **Komponent Wizualizacyjny**: Komponent [KnowledgeGraph.tsx](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/components/KnowledgeGraph.tsx) pobiera strukturę z endpointu `/api/books/[bookId]/graph` i renderuje dynamiczny graf siłowy (force-directed) z możliwością powiększania/przesuwania oraz klikania węzłów w celu ich wyboru.

### E. AI Tutor (RAG i Czat)
*   **Pobieranie Kontekstu (RAG)**: Usługa [KnowledgeQueryService.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/services/KnowledgeQueryService.ts) pobiera fragmenty tekstu najbliższe semantycznie do pytania użytkownika oraz (jeśli wybrano węzeł na grafie) dołącza treść wybranego węzła i jego bezpośrednich sąsiadów.
*   **Silnik Konwersacyjny**: Usługa [TutoringService.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/services/TutoringService.ts) oraz adapter [OpenAILlmAdapter.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/adapters/OpenAILlmAdapter.ts) obsługują logikę czatu. Tutor AI instruowany jest do prowadzenia ucznia za rękę krok po kroku (nie podaje gotowych odpowiedzi, lecz zadaje pytania pomocnicze).
*   **Komponent Czatu**: Komponent [ChatPanel.tsx](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/components/ChatPanel.tsx) umożliwia wysyłanie wiadomości, wyświetla dymki konwersacji oraz zintegrowany odtwarzacz wideo awatara.

### F. Integracja z Wideo Awatarami
*   **Generowanie Awatara**: Usługa [AvatarService.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/services/AvatarService.ts) i adapter [HeyGenAvatarAdapter.ts](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/server/adapters/HeyGenAvatarAdapter.ts) obsługują tworzenie klipów wideo, w których wirtualny nauczyciel wypowiada wygenerowaną odpowiedź. *(Aktualnie adapter zwraca adres testowy i oczekuje na wdrożenie produkcyjne API).*
*   **Odtwarzacz Wideo**: Komponent [AvatarPlayer.tsx](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/src/components/AvatarPlayer.tsx) wyświetla wideo-odpowiedzi bezpośrednio w panelu konwersacji.

### G. Statystyki i Zarządzanie
*   **Dashboard Ucznia**: Panel [dashboard/page.tsx](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/app/dashboard/page.tsx) wyświetlający statystyki konta (liczba książek, stron, chunków), listę wgranych pozycji wraz ze statusami oraz przycisk do przesyłania nowych materiałów.
*   **Panel Administratora**: Widok [admin/page.tsx](file:///C:/Users/LENOVO/hackEduApp/hack-edu-app/app/admin/page.tsx) pozwalający osobom o uprawnieniach `ADMIN` na podgląd listy użytkowników, statystyk ich kont (wgrane książki, aktywne sesje) i daty utworzenia kont.
