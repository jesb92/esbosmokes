# Execute con mapas administrables

Esta actualización convierte Execute en una estructura igual a la portada principal:

1. `execute.html` muestra tarjetas de mapas.
2. Al pulsar un mapa se abre `execute-map.html?map=slug`.
3. Esa página muestra las tarjetas Execute asignadas al mapa.
4. Cada tarjeta abre su detalle con vídeo, fotos y pasos.
5. `execute-admin.html` permite crear, editar y eliminar mapas y tarjetas.

## Archivos que debes copiar o reemplazar

- `execute.html`
- `execute-map.html` (nuevo)
- `execute-detail.html`
- `execute-admin.html`
- `js/execute.js`
- `js/execute-map.js` (nuevo)
- `js/execute-detail.js`
- `js/execute-admin.js`
- `css/execute.css`

La carpeta también contiene un `data/executes.json` de ejemplo. Si ya tienes tarjetas propias, conserva una copia de tu JSON antes de reemplazarlo.

## Migrar tu JSON anterior

El nuevo editor acepta el formato anterior y lo convierte automáticamente:

1. Abre `execute-admin.html` con la web funcionando.
2. Pulsa **Importar JSON**.
3. Selecciona tu antiguo `executes.json`.
4. El editor creará automáticamente los mapas que encuentre en tus tarjetas.
5. Revisa las imágenes de los mapas.
6. Pulsa **Exportar executes.json**.
7. Reemplaza `data/executes.json` con el archivo descargado.

## Añadir un mapa

En **Gestionar mapas** introduce:

- Nombre: `Dust 2`
- Slug: `dust2`
- Imagen: `assets/maps/dust2.jpg`
- Descripción: el texto que aparecerá en la tarjeta

Copia físicamente la imagen a `assets/maps/` y pulsa **Añadir mapa**.

## Añadir una tarjeta al mapa

En **Gestionar tarjetas Execute**:

1. Selecciona el mapa en el desplegable.
2. Añade título, portada, vídeo, fotos y pasos.
3. Pulsa **Crear tarjeta**.
4. Exporta el JSON al terminar.

## Publicar en GitHub

Reemplaza `data/executes.json`, añade las imágenes y vídeos, y después usa GitHub Desktop:

1. Commit to main
2. Push origin

Los vídeos individuales deben pesar menos de 100 MiB para un repositorio Git normal.
