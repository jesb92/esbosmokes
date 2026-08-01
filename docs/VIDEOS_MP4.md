# Añadir vídeos MP4

## 1. Preparar el vídeo

Formato recomendado:

```text
MP4 con vídeo H.264
```

Utiliza nombres sencillos, sin espacios ni tildes:

```text
mirage-window-smoke.mp4
```

## 2. Subirlo al repositorio

En GitHub abre:

```text
assets/videos/
```

Sube el MP4 y confirma el cambio.

## 3. Asignarlo a una lineup

En `admin.html`, escribe en el campo de vídeo:

```text
assets/videos/mirage-window-smoke.mp4
```

Después exporta `nades.json` y reemplaza `data/nades.json` en GitHub.

## Vídeo externo

También puedes escribir una dirección directa terminada en `.mp4` o una URL de YouTube:

```text
https://youtu.be/IDENTIFICADOR
```

## Vídeo de prueba

El proyecto incluye:

```text
assets/videos/video-prueba-lineup.mp4
```

Está asignado a la primera lineup de Mirage.
