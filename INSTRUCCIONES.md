# Corrección: el botón Guardar cambios no funciona

## Causa

El `admin.html` nuevo y `js/admin.js` antiguo pueden quedar mezclados por la caché de GitHub Pages o porque solo se reemplazó uno de los dos archivos. El JavaScript antiguo busca `videoUrl`, pero el formulario nuevo usa `videos`, y el guardado se detiene.

## Instalar

Reemplaza:

- `admin.html`
- `js/admin.js`
- `css/nade-multiple-videos.css`

No reemplaces `data/nades.json`.

El HTML usa `?v=4` para obligar al navegador a descargar el JavaScript nuevo.

## Probar

1. Abre `admin.html`.
2. Pulsa Editar en una smoke.
3. Añade vídeos.
4. Pulsa Guardar cambios.
5. Debajo de Exportar JSON debe aparecer un mensaje indicando cuántos vídeos se guardaron.
6. Pulsa Exportar JSON y sustituye `data/nades.json`.

Si vuelve a fallar, ahora el error concreto aparecerá escrito al final de la página.
