# Come compilare e testare lo script

## Requisiti

- Installare Node.js LTS da https://nodejs.org/
- Aprire un terminale nella cartella `assets/basket/2.14.1`

Su Windows non serve WSL. Si puo usare PowerShell o il Prompt dei comandi.

Esempio PowerShell:

```powershell
cd C:\percorso\del\progetto\assets\basket\2.14.1
```

## Prima installazione

Eseguire una sola volta:

```bash
npm ci
```

Questo comando installa Webpack e le altre dipendenze indicate in `package-lock.json`.

## Build

Per creare il file JavaScript:

```bash
npm run build
```

Il file generato si trova qui:

```text
build/main.js
```

Per una build senza sourcemap, piu simile alla produzione:

```bash
npm run build:production
```

## Test veloce

Per testare la nuova build, usare temporaneamente `build/main.js` al posto dello script pubblicato online.

Nei file HTML in `dev/` o `prod/`, cercare una riga simile a questa:

```html
<script src="https://zingerle.group/build/basket/2.14/main.js?v=1.0.0" type="text/javascript"></script>
```

e sostituirla temporaneamente con:

```html
<script src="../build/main.js" type="text/javascript"></script>
```

Poi aprire il file HTML nel browser o nell'ambiente di test usato per pCon Basket.

## Dopo le modifiche

Quando il test e corretto, inviarci i file di `src/...` modificati