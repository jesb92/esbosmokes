# Corrección multivídeo revisada sobre tu ZIP

## Fallos encontrados

1. `admin.html` y `js/admin.js` ya contenían parte del sistema multivídeo.
2. `nade.html` y `js/nade.js` seguían siendo la versión antigua y solo leían `videoUrl`.
3. `admin.html` cargaba `css/nade-multiple-videos.css`, pero ese archivo no existía.
4. El campo de texto por líneas hacía difícil comprobar si cada vídeo se había guardado correctamente.

## Qué cambia

El administrador ahora muestra una fila por vídeo:

- Título del vídeo.
- Ruta o URL.
- Botón para eliminarlo.
- Botón para añadir otro vídeo.
- Selector múltiple de MP4.

Al guardar, el JSON contiene:

```json
"videos": [
  {
    "title": "Spawn 1",
    "url": "assets/videos/mirage/spawn-1.mp4"
  },
  {
    "title": "Spawn 2",
    "url": "assets/videos/mirage/spawn-2.mp4"
  }
],
"videoUrl": "assets/videos/mirage/spawn-1.mp4"
```

`videoUrl` conserva el primer vídeo para mantener compatibilidad.

## Archivos que debes reemplazar

- `admin.html`
- `nade.html`
- `js/admin.js`
- `js/nade.js`

Añade:

- `css/nade-multiple-videos.css`

No reemplaces `data/nades.json`.

## Uso

1. Abre `admin.html`.
2. Pulsa Editar en una lineup.
3. Usa Añadir vídeo o Seleccionar varios MP4.
4. Completa las rutas.
5. Pulsa Guardar cambios.
6. Pulsa Exportar JSON.
7. Sustituye `data/nades.json`.
8. Copia físicamente los MP4 a las rutas indicadas.
9. Haz commit y push.

La página de detalle muestra botones para cambiar entre los vídeos, de modo que una lineup con 10 vídeos no carga diez reproductores simultáneamente.
