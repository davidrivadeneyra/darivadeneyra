# Implementation Guidelines

## Layout y secciones

Siempre usa las clases existentes para layouts y secciones:

- `.section`: padre de la sección.
- `.section-content`: hijo principal de la sección.
- `.section-inner`: usar solo si se pide explicitamente.
- `.section-inner-content`: usar solo si se pide explicitamente.

No uses `max-width` para textos nunca o secciones o divs, a menos que se pida explicitamente.

No crees responsive para textos con clases como `md:` a menos que se pida empezar a trabajar en responsive.

## Colores

No inventes colores.

Aunque Figma traiga un color que no reconozcas en la guia de estilos del CSS, no lo uses directamente. Usa solo el color existente de la guia de estilos CSS que sea mas cercano al color de Figma.

Siempre usa las clases CSS ya creadas para colores.

## Tipografia

No inventes tamanos de fuente.

Si Figma trae un tamano que no existe en la guia de estilos CSS, usa el tamano existente mas cercano. Por ejemplo, si Figma trae `15px`, usa el tamano mas cercano de la guia, como `16px`.

Siempre usa las clases CSS ya creadas para:

- Colores.
- Fuentes.
- Tamanos de texto.
- Tipos de fuente.

## Nuevas clases CSS

Puedes crear nuevas clases CSS para layouts o animaciones solo cuando no exista ya una clase creada que resuelva esa necesidad.
