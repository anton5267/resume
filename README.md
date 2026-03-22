# Resume Website

Статичний bilingual-сайт Антона Лиштви для подачі в Німеччині. Проєкт не має бекенду, працює як звичайний `HTML/CSS/JS` сайт і деплоїться через GitHub Pages.

Production:

- `https://anton5267.github.io/resume/`
- `https://anton5267.github.io/resume/short-cv.html`
- `https://anton5267.github.io/resume/diploma.html`
- `https://anton5267.github.io/resume/anschreiben-template.html`

## Структура

- `index.html` — повне резюме `UA / DE`
- `short-cv.html` — коротке односторінкове CV `UA / DE`
- `diploma.html` — сторінка з PDF диплома IT Step Academy
- `anschreiben-template.html` — окремий шаблон супровідного листа німецькою
- `resume-data.js` — головне джерело даних і перекладів
- `script.js` — рендеринг повного CV
- `short-cv.js` — рендеринг короткого CV
- `diploma.js` — рендеринг сторінки диплома
- `styles.css` — web + mobile + print стилі
- `assets/` — фото, preview і PDF

## Що редагувати

Основний контент редагується в `resume-data.js`:

- контакти
- тексти `UA / DE`
- освіта
- проєкти
- навички
- коротке CV
- тексти сторінки диплома

Фото лежить у `assets/profile-photo.jpg`.

## PDF

На публічних сторінках є кнопка `PDF herunterladen` / `Завантажити PDF`.

Схема однакова:

1. Відкрити потрібну сторінку
2. Натиснути кнопку PDF
3. У діалозі друку вибрати `Save as PDF`

`short-cv.html` зібраний як окрема коротка print-first версія.

## Локальний запуск

Можна просто відкрити `index.html` у браузері або підняти локальний сервер:

```powershell
python -m http.server 8080
```

Після цього:

- `http://127.0.0.1:8080/`
- `http://127.0.0.1:8080/short-cv.html`
- `http://127.0.0.1:8080/diploma.html`
- `http://127.0.0.1:8080/anschreiben-template.html`

## Деплой

GitHub Pages деплоїться через `.github/workflows/deploy-pages.yml`.

Після пушу в `main` сайт оновлюється автоматично.
