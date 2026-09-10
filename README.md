# T-Conecta — sitio estático

Home y Nosotros/Contacto en HTML, CSS y JavaScript plano. Sin dependencias ni build.

## Estructura

```
index.html      Home
nosotros.html   Nosotros y Contacto
styles.css      Estilos globales, animaciones y breakpoints
script.js       Menú móvil, scroll reveal, partículas del hero, formulario
enviar.php      Endpoint de correo del formulario
assets/         Imágenes e iconos
```

## Instalación

Sube todo a la raíz del hosting. No requiere compilación.

## Formulario de contacto

Envía a **tconectasiempre@gmail.com** vía `enviar.php`.

Antes de publicar, edita `enviar.php`:

1. Ajusta la constante `ORIGENES` con tu dominio real.
2. Elige el método de envío:
   - **Opción A (recomendada):** si el sitio corre sobre WordPress, descomenta el bloque `wp_mail`. Hereda la configuración SMTP del sitio y evita el spam.
   - **Opción B (activa por defecto):** `mail()` nativo de PHP. En hostings compartidos suele terminar en spam.

El botón de envío permanece deshabilitado hasta que estén completos nombre, apellidos, email, celular, asunto, mensaje y la casilla de autorización. Empresa es opcional.

## Integración con WooCommerce

Los CTA de catálogo, Zona Gamer, categorías y ofertas apuntan a `#`. Reemplaza esos `href` por las URL reales de la tienda.

Ubicaciones: navegación del header, menú móvil, botones del hero, tarjetas de la sección Ecosistema, tarjetas de producto y enlaces del footer.

## Notas técnicas

- La imagen del hero se sirve en WebP (96 KB) con PNG de respaldo mediante `<picture>`.
- Las animaciones respetan `prefers-reduced-motion`.
- El fondo de partículas del hero de Nosotros usa canvas 2D, sin librerías.
