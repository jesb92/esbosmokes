# Personalizar el estilo

La apariencia está en:

```text
css/styles.css
```

## Colores principales

Modifica las variables del principio:

```css
:root {
  --bg: #0c0e12;
  --panel: #15181e;
  --panel-2: #1b1f27;
  --line: #2a303b;
  --text: #f5f7fa;
  --muted: #a6afbd;
  --accent: #f3c969;
  --accent-2: #65c8ff;
  --radius: 18px;
}
```

## Logotipo

Sustituye:

```text
assets/logo.svg
```

Mantener el mismo nombre evita modificar el código.

## Número de tarjetas por fila

Mapas:

```css
.map-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

Lineups:

```css
.nade-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

Después de subir los cambios, recarga la página con `Ctrl + F5`.
