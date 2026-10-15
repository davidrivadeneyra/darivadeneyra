---
# Duplica este archivo y renómbralo con el slug del caso: nombre-del-proyecto.md
title: Nombre del proyecto
excerpt: Descripción breve para SEO y metadatos del caso.
services: Design & Development
location: Peru
year: 2026

# Con una URL real se muestra como enlace animado con ícono.
externalUrl: https://example.com
# Si aún no existe una URL, escribe texto y se mostrará sin animación ni ícono:
# externalUrl: In Progress
# También se conserva esta alternativa por compatibilidad:
# siteText: Próximamente

# Guarda todos los archivos del caso en public/images/work/nombre-del-proyecto/.
# En este Markdown escribe solo /nombre-del-proyecto/archivo.ext.
# La portada puede ser imagen o video.
cardImage: /nombre-del-proyecto/card.png
cardAlt: Descripción accesible de la imagen del card

# Imágenes o videos internos, en el orden en que deben aparecer.
# Con background: se muestra con fondo y padding.
# Sin background: ocupa todo el ancho, sin padding lateral.
# Los videos se detectan por su extensión (.mp4, .webm, .ogg o .mov).
images:
  - src: /nombre-del-proyecto/01.png
    background: "#FEF2E6"
    alt: Descripción de la primera imagen
  - src: /nombre-del-proyecto/02.png
    alt: Descripción de la imagen a ancho completo
  - src: /nombre-del-proyecto/demo.mp4
    alt: Demostración del proyecto

# Usa únicamente IDs existentes en src/data/project-tags.json.
tags:
  - product-design
  - web-design

# Debe haber exactamente tres proyectos marcados para Home, con posiciones 1, 2 y 3.
showOnHome: false
# homeOrder: 1

# Orden general dentro de /work.
order: 2

---

## El proyecto

Describe el contexto, el reto y el objetivo del proyecto.

## Proceso

Explica las decisiones de diseño, desarrollo y colaboración.

## Resultado

Resume el resultado y el impacto obtenido.
