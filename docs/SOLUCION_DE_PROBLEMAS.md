# Solución de problemas

## GitHub Pages no aparece

El repositorio debe ser público cuando utilizas GitHub Free. Después vuelve a `Settings > Pages`.

## La web muestra un error al cargar JSON

Comprueba que exista:

```text
data/nades.json
```

También comprueba que `index.html` esté en la raíz del repositorio.

## Una imagen o un vídeo no carga

Las rutas distinguen mayúsculas y minúsculas:

```text
assets/videos/Smoke.mp4
```

no es igual que:

```text
assets/videos/smoke.mp4
```

No utilices rutas de Windows como `C:\Users\...`.

## Los cambios todavía no aparecen

1. Espera a que termine el despliegue de GitHub Pages.
2. Recarga con `Ctrl + F5`.
3. Comprueba la pestaña `Actions` por si hay un despliegue en curso o fallido.

## El editor no guarda directamente

Es el comportamiento normal. Exporta `nades.json` y súbelo manualmente a `data/nades.json`.
