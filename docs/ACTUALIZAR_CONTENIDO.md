# Actualizar mapas y lineups

## Usar el editor

Abre:

```text
https://TU-USUARIO.github.io/TU-REPOSITORIO/admin.html
```

El editor tiene dos secciones:

- **Gestionar mapas:** añade las tarjetas que aparecen en la portada.
- **Gestionar lineups:** añade tutoriales, vídeos, instrucciones y metadatos.

## Guardar los cambios

El navegador no tiene permiso para escribir en GitHub. Al terminar:

1. Pulsa **Exportar JSON**.
2. Se descargará `nades.json`.
3. En GitHub abre la carpeta `data`.
4. Sube el nuevo `nades.json` y reemplaza el anterior.
5. Pulsa `Commit changes`.

## Añadir una imagen de mapa

1. Sube la imagen a `assets/maps/`.
2. En el editor escribe una ruta como:

```text
assets/maps/dust2.webp
```

3. Exporta y reemplaza `data/nades.json`.

## Añadir una tarjeta a la portada

En **Gestionar mapas**, completa:

```text
Nombre: Dust 2
Slug: dust2
Imagen: assets/maps/dust2.svg
Descripción: Smokes y flashes para largo, medio y B.
```

Cada mapa guardado en el JSON crea una tarjeta automáticamente.

## Borrar un mapa

No se puede borrar un mapa mientras tenga lineups asociadas. Borra o mueve primero sus lineups.
