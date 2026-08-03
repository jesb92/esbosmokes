# Foto encima del vídeo

Esta actualización utiliza la imagen que ya guardas en el campo `thumbnail`.

## Archivos que debes reemplazar

- `nade.html`
- `js/nade.js`
- `css/nade-multiple-videos.css`

No reemplaces:

- `admin.html`
- `js/admin.js`
- `data/nades.json`

## Uso

En `admin.html`, deja en Miniatura una ruta como:

```text
assets/insta/mirage/spawn-reference.jpg
```

En `nades.json` aparecerá:

```json
"thumbnail": "assets/insta/mirage/spawn-reference.jpg"
```

Esa imagen se mostrará encima del selector y del reproductor. Será la misma imagen para todos los vídeos de esa lineup.

Si la ruta no existe o la imagen falla al cargar, el bloque se ocultará automáticamente.
