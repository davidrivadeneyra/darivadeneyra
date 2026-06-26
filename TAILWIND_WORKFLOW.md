# Tailwind Workflow

Este proyecto usa Tailwind con flujo input/output mediante Tailwind CLI.

## Archivos principales

- `src/styles/input.css`: archivo fuente. Aqui viven `@tailwind base`, `@tailwind components`, `@tailwind utilities`, fuentes y estilos custom.
- `src/styles/output.css`: archivo generado por Tailwind. Astro importa este archivo.
- `tailwind.config.mjs`: tokens de diseno, fuentes, colores y tamanos de texto.
- `scripts/tailwind-watch.mjs`: watcher custom para regenerar `output.css` cuando cambia el config o el codigo fuente.

Astro lee el CSS desde:

```astro
import '../styles/output.css'
```

en `src/layouts/BaseLayout.astro`.

## Por que no usamos `@astrojs/tailwind`

En este proyecto queremos iterar rapido sobre tokens en `tailwind.config.mjs`.

No uses `@astrojs/tailwind` para evitar doble compilacion y dejar una sola fuente de verdad:

```txt
tailwind.config.mjs + src/styles/input.css
        ↓
Tailwind CLI
        ↓
src/styles/output.css
        ↓
Astro
```

## Scripts

Desarrollo:

```bash
npm run dev
```

Este comando:

1. Genera `src/styles/output.css` una vez.
2. Levanta el watcher de Tailwind.
3. Levanta `astro dev`.

Build de produccion:

```bash
npm run build
```

Este comando genera `output.css` minificado y luego corre `astro build`.

Watcher manual de Tailwind:

```bash
npm run tailwind:watch
```

## Por que existe un watcher custom

El comando nativo:

```bash
tailwindcss --watch
```

no siempre recarga confiablemente cambios en `tailwind.config.mjs`. El proceso puede detectar cambios en archivos `.astro` o `.css`, pero mantener una version vieja del config hasta reiniciar.

Por eso `scripts/tailwind-watch.mjs` hace polling de:

- `tailwind.config.mjs`
- `src/styles/input.css`
- archivos dentro de `src`

Cuando detecta cambios, ejecuta un build fresco de Tailwind. Asi `tailwind.config.mjs` se vuelve a leer desde cero.

## Flujo recomendado

Para trabajar normalmente:

```bash
npm run dev
```

Despues de iniciar ese proceso, cambios en `tailwind.config.mjs` deberian regenerar `src/styles/output.css` sin reiniciar manualmente.

Si el navegador no refleja el cambio, revisar:

1. Que `src/styles/output.css` haya cambiado.
2. Que el proceso `npm run dev` este usando el script actualizado.
3. Que no haya otro servidor viejo corriendo.

## Nota sobre `public/styles/output.css`

Tambien seria posible compilar Tailwind hacia:

```txt
public/styles/output.css
```

y cargarlo con:

```html
<link rel="stylesheet" href="/styles/output.css" />
```

Eso es mas directo en desarrollo, pero deja el CSS fuera del pipeline de Vite/Astro. El enfoque actual mantiene `output.css` dentro de `src`, para que Astro/Vite lo procese como parte del build.
