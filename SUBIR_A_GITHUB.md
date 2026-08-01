# Cómo publicar EsboSmokes en GitHub Pages

## 1. Crear el repositorio

1. En GitHub pulsa `New repository`.
2. Escribe un nombre, por ejemplo `esbosmokes`.
3. Selecciona **Public**.
4. Pulsa `Create repository`.

GitHub Free necesita que el repositorio sea público para utilizar GitHub Pages.

## 2. Subir los archivos

Descomprime el ZIP. Dentro verás `index.html`, `admin.html`, `assets`, `css`, `data` y `js`.

En GitHub:

1. Pulsa `Add file > Upload files`.
2. Arrastra **todos los archivos y carpetas que están dentro de `esbosmokes-github`**.
3. Confirma con `Commit changes`.

La raíz del repositorio debe quedar así:

```text
index.html
admin.html
map.html
nade.html
favorites.html
.nojekyll
assets/
css/
data/
js/
```

No debe quedar así:

```text
esbosmokes-github/
└── index.html
```

## 3. Activar GitHub Pages

1. Abre `Settings` dentro del repositorio.
2. Entra en `Pages`.
3. En `Source`, selecciona `Deploy from a branch`.
4. Selecciona la rama `main`.
5. Selecciona la carpeta `/(root)`.
6. Pulsa `Save`.

Espera unos minutos. GitHub mostrará el enlace de la web en la misma página.

## 4. Comprobar la publicación

La URL será parecida a:

```text
https://TU-USUARIO.github.io/esbosmokes/
```

Prueba también:

```text
https://TU-USUARIO.github.io/esbosmokes/admin.html
```

## 5. Actualizar la web

Cuando modifiques un archivo:

1. Abre su carpeta en el repositorio.
2. Pulsa `Add file > Upload files`.
3. Arrastra la versión nueva.
4. Confirma el reemplazo.
5. Pulsa `Commit changes`.

GitHub Pages volverá a publicar la web automáticamente.

## Importante sobre los vídeos

Los MP4 se guardan en `assets/videos/`. Intenta que sean pequeños y estén comprimidos. Para una biblioteca grande, utiliza vídeos externos en lugar de llenar el repositorio con archivos pesados.
