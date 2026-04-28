# pangram-ui

Простой UI на React + TypeScript для работы с [Pangram Labs](https://pangramlabs.com/) AI-detection API.
Ключ хранится локально в `localStorage` и никуда не уходит, кроме официального API.

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес из консоли, вставьте ваш API-ключ — и можно работать.

## Сборка

```bash
npm run build
npm run preview
```

## Стек

- Vite + React 18 + TypeScript
- Без внешних UI-библиотек, чистый CSS

## Эндпоинт

По умолчанию используется `https://text.api.pangramlabs.com/` с заголовком `x-api-key`.
Если нужен другой — поменяйте `ENDPOINT` в [src/lib/pangram.ts](src/lib/pangram.ts).
