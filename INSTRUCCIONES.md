# Vídeos añadidos manualmente por ruta

Esta versión elimina el selector de archivos del administrador.

Cada vídeo tiene dos campos visibles:

- Nombre del vídeo.
- Ruta del vídeo.

Ejemplo:

```text
Nombre: Spawn 1
Ruta: assets/videos/mirage/spawn-1.mp4
```

Para añadir más vídeos, pulsa **Añadir otra ruta**. Puedes añadir hasta 20.

## Instalar

Reemplaza:

- `admin.html`
- `js/admin.js`
- `css/nade-multiple-videos.css`

No reemplaces:

- `data/nades.json`
- `nade.html`
- `js/nade.js`

## Guardar

1. Abre `admin.html`.
2. Edita una lineup.
3. Escribe las rutas de los vídeos.
4. Pulsa **Guardar cambios**.
5. Pulsa **Exportar JSON**.
6. Sustituye `data/nades.json`.
7. Copia los vídeos físicamente a las rutas indicadas.
8. Haz commit y push.

El JSON conservará todos los vídeos dentro de `videos` y copiará el primero en `videoUrl` para compatibilidad.
