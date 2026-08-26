# Una foto de referencia distinta para cada vídeo

Ahora el campo `Vídeos, uno por línea` acepta:

```text
Spawn 1 | assets/insta/ancient/T/pos1.mp4 | assets/insta/ancient/T/pos1.jpg
Spawn 2 | assets/insta/ancient/T/pos2.mp4 | assets/insta/ancient/T/pos2.jpg
Spawn 3 | assets/insta/ancient/T/pos3.mp4 | assets/insta/ancient/T/pos3.jpg
Spawn 4 | assets/insta/ancient/T/pos4.mp4 | assets/insta/ancient/T/pos4.jpg
Spawn 5 | assets/insta/ancient/T/pos5.mp4 | assets/insta/ancient/T/pos5.jpg
```

Formato:

`Nombre | vídeo | foto`

La foto es opcional.

## Compatibilidad

Tus líneas antiguas siguen funcionando:

```text
Spawn 1 | assets/insta/ancient/T/pos1.mp4
```

Si un vídeo no tiene foto propia, se utiliza el campo general `Imagen de referencia`.

## JSON exportado

Cada vídeo se guarda así:

```json
{
  "title": "Spawn 1",
  "url": "assets/insta/ancient/T/pos1.mp4",
  "image": "assets/insta/ancient/T/pos1.jpg"
}
```

Al cambiar de Spawn en el desplegable, cambian simultáneamente:

- el título,
- la foto de referencia,
- el vídeo.

## Reemplaza

- `admin.html`
- `js/admin.js`
- `nade.html`
- `js/nade.js`
- `css/nade-multiple-videos.css`

No reemplaces `data/nades.json`.
