# webflow

Scripts y estilos custom del sitio de Holdo en Webflow (proyecto `holdo-2.0`).

## Cómo llegan a producción

No hay build ni deploy. Webflow carga cada archivo directo desde este repo vía
[jsDelivr](https://www.jsdelivr.com/github), con una URL de la forma:

```
https://cdn.jsdelivr.net/gh/toescalabs/webflow@<tag | rama | commit>/<ruta>
```

Lo que va después de `@` decide qué versión se sirve. **Producción siempre apunta a un tag**
(`@v1.0.0`), nunca a una rama: un tag no cambia, así que producción solo se mueve cuando alguien
edita la URL en Webflow. Una rama se mueve con cada push (y jsDelivr la cachea, así que el cambio
tarda en verse).

## Flujo de trabajo

1. Rama desde `develop` y cambios.
2. Probar en Webflow apuntando la URL a la rama (`@mi-rama/scripts/archivo.js`), idealmente en
   una página o el staging de Webflow, no en una página publicada.
3. PR a `develop` y merge.
4. Crear un tag nuevo sobre `develop` (`git tag v1.1.0 && git push origin v1.1.0`).
5. En el custom code de Webflow, cambiar `@vX.Y.Z` por el tag nuevo en las URLs que correspondan
   y publicar.

Para volver atrás basta con apuntar de nuevo al tag anterior.

## Archivos

| Archivo | Qué hace |
|---|---|
| `scripts/update-id-selector-with-yield.js` | Rentabilidades por perfil en selectores (recomendaciones, Harry IPSA, Wallet, Deuda Privada, Smart CLP) |
| `scripts/update-chart.js` | Gráfico de rentabilidad histórica |
| `scripts/cursor-effect.js` | Efecto visual del cursor |
| `scripts/slider.js` + `css/slider.css` | Slider |
| `css/blog.css` | Estilos del blog |

Los datos salen de la API de rentabilidades
(`https://91o7sqo7s3.execute-api.us-east-1.amazonaws.com/prod/`).
