# EsboSmokes — versión GitHub Pages

Web estática para organizar lineups de Counter-Strike 2. Está preparada para publicarse directamente con GitHub Pages.

## No necesita

- Python
- Node.js
- Base de datos
- Servidor propio
- Instalación de dependencias

## Funciones incluidas

- Tarjetas de mapas generadas desde `data/nades.json`.
- Smokes, molotovs, flashes y HE.
- Búsqueda y filtros por equipo y dificultad.
- Página individual para cada lineup.
- Vídeos MP4/WebM alojados en el repositorio o vídeos de YouTube.
- Favoritos guardados en el navegador.
- Editor para añadir, editar y borrar mapas y lineups.
- Importación y exportación del archivo `nades.json`.
- Diseño adaptado a móvil.
- Archivo `.nojekyll` para publicar los archivos directamente en GitHub Pages.

## Publicación rápida

1. Crea un repositorio **público** en GitHub.
2. Descomprime este ZIP.
3. Sube **el contenido** de esta carpeta a la raíz del repositorio.
4. Comprueba que `index.html` aparece directamente en la página principal del repositorio.
5. Abre `Settings > Pages`.
6. Elige `Deploy from a branch`.
7. Selecciona `main` y `/(root)`.
8. Pulsa `Save`.

La dirección será similar a:

```text
https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/
```

Consulta [SUBIR_A_GITHUB.md](SUBIR_A_GITHUB.md) para ver el proceso completo.

## Editar contenido

Abre `admin.html` desde la web publicada. El editor permite modificar mapas y lineups, pero no puede guardar directamente en GitHub.

Proceso:

1. Haz los cambios en el editor.
2. Pulsa **Exportar JSON**.
3. En GitHub, reemplaza `data/nades.json` por el archivo descargado.
4. Sube también las imágenes o vídeos nuevos.
5. Confirma el cambio. GitHub Pages actualizará la web.

## Estructura

```text
esbosmokes-github/
├── .nojekyll
├── index.html
├── map.html
├── nade.html
├── favorites.html
├── admin.html
├── 404.html
├── css/
│   └── styles.css
├── js/
│   ├── common.js
│   ├── home.js
│   ├── map.js
│   ├── nade.js
│   ├── favorites.js
│   └── admin.js
├── data/
│   └── nades.json
├── assets/
│   ├── logo.svg
│   ├── maps/
│   └── videos/
└── docs/
```

## Documentación

- [SUBIR_A_GITHUB.md](SUBIR_A_GITHUB.md)
- [docs/ACTUALIZAR_CONTENIDO.md](docs/ACTUALIZAR_CONTENIDO.md)
- [docs/VIDEOS_MP4.md](docs/VIDEOS_MP4.md)
- [docs/PERSONALIZAR_ESTILO.md](docs/PERSONALIZAR_ESTILO.md)
- [docs/SOLUCION_DE_PROBLEMAS.md](docs/SOLUCION_DE_PROBLEMAS.md)

## Aviso

Proyecto independiente y educativo. No está afiliado con Valve ni con CSNADES.gg. Utiliza únicamente imágenes, vídeos y marcas para los que tengas permiso.
