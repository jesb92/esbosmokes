# Corrección del error `video is null`

El error aparece porque `nade.html` y `js/nade.js` pertenecen a versiones diferentes.

## Reemplaza estos archivos

- `nade.html`
- `js/nade.js`
- `css/nade-multiple-videos.css`

No reemplaces `data/nades.json`.

## Después

1. Haz commit y push.
2. Espera a que GitHub Pages termine el despliegue.
3. Abre una smoke.
4. Recarga con `Ctrl + F5`.

El nuevo JavaScript acepta tanto:

```html
<div data-video></div>
```

como:

```html
<div data-video-section></div>
```

por lo que no volverá a intentar usar `innerHTML` sobre un elemento inexistente.
