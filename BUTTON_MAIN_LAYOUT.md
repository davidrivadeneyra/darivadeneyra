### Button Structure

El botón está construido como un contenedor rectangular de altura fija `56px`, con padding externo mínimo de `1px`. Su estructura se divide en tres capas principales:

1. **Root / Button Container**
   - Contenedor principal del botón.
   - Usa layout horizontal `flex`.
   - Altura fija: `56px`.
   - Padding externo: `1px`.
   - Posición relativa para permitir capas internas absolutas.

2. **Background Gradient**
   - Capa absoluta que ocupa todo el botón.
   - Usa un gradiente horizontal de izquierda a derecha:
     azul intenso → celeste → blanco verdoso → amarillo → naranja → rojo.
   - Funciona como fondo visual principal del estado default.

3. **Content Wrapper**
   - Contenedor interno para el contenido textual.
   - Ocupa toda la altura del botón.
   - Usa layout vertical `flex-column`.
   - Padding interno:
     - `15px` izquierda
     - `63px` derecha
     - `12px` arriba/abajo
   - Tiene `overflow: hidden` para recortar elementos internos si exceden el área.

Dentro del `Content Wrapper` hay dos elementos:

- **Triangle**
  - Elemento absoluto ubicado en la esquina superior derecha.
  - Tamaño: `28 × 28px`.
  - Representa el corte/acento diagonal negro del botón.

- **Text Group**
  - Dos líneas de texto independientes:
    - `Book`
    - `a free call`
  - Tipografía: `Geomanist Regular`.
  - Tamaño: `16px`.
  - Line-height: `1.1`.
  - Tracking: `-0.64px`.
  - Color: `#0A0A0A`.
  - Texto en mayúsculas.
  - Alineación izquierda.

La estructura permite que el botón mantenga una forma compacta y fija, mientras el fondo gráfico y el triángulo funcionan como elementos decorativos independientes del contenido.
