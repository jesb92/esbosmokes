# Instalar la pestaña Execute

Copia estos archivos y carpetas en la raíz de tu proyecto EsboSmokes:

- `execute.html`
- `execute-detail.html`
- `execute-admin.html`
- `js/execute.js`
- `js/execute-detail.js`
- `js/execute-admin.js`
- `css/execute.css`
- `data/executes.json`
- `assets/executes/`

No reemplaces tus carpetas completas: fusiona el contenido.

## Añadir la pestaña al menú

Abre `js/common.js`. Dentro de `renderHeader()`, coloca esta línea entre Mapas y Favoritos:

```javascript
<a class="${active === 'execute' ? 'active' : ''}" href="execute.html">Execute</a>
```

El menú debe quedar parecido a:

```javascript
<a class="${active === 'maps' ? 'active' : ''}" href="index.html#maps">Mapas</a>
<a class="${active === 'execute' ? 'active' : ''}" href="execute.html">Execute</a>
<a class="${active === 'favorites' ? 'active' : ''}" href="favorites.html">Favoritos <span class="badge-count" data-favorites-count>0</span></a>
```

## Usar el editor

Abre:

`execute-admin.html`

En GitHub Pages:

`https://TU-USUARIO.github.io/TU-REPOSITORIO/execute-admin.html`

1. Copia la portada y las fotos a `assets/executes/`.
2. Copia los vídeos MP4 a `assets/videos/`.
3. Escribe las rutas en el editor.
4. Pulsa `Exportar JSON`.
5. Reemplaza `data/executes.json` por el archivo descargado.
6. Haz commit y push.

Ejemplos de rutas:

- Portada: `assets/executes/mirage-a-cover.jpg`
- Vídeo: `assets/videos/mirage-a.mp4`
- Foto adicional: `assets/executes/mirage-a-smoke-ct.jpg`

El editor no puede mover los archivos por sí solo; únicamente guarda sus rutas en el JSON.
