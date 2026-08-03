# Multivídeo por líneas, sin límite programado

Reemplaza:

- `admin.html`
- `nade.html`
- `js/admin.js`
- `js/nade.js`
- `css/nade-multiple-videos.css`

No reemplaces `data/nades.json`.

En **Vídeos, uno por línea** escribe:

```text
Spawn 1 | assets/insta/mirage/pos1.mp4
Spawn 2 | assets/insta/mirage/pos2.mp4
Spawn 3 | assets/insta/mirage/pos3.mp4
```

No existe un límite programado. Cada línea válida se guarda dentro de `videos`.

Después pulsa **Guardar cambios**, **Exportar JSON** y sustituye `data/nades.json`.

`videoUrl` se rellena automáticamente con el primer vídeo para conservar compatibilidad.
