# Política de privacidad de IP Flag

Fecha de entrada en vigor: 11 de agosto de 2026.

[English](privacy.html) · [Русский](privacy-ru.html)

IP Flag es una extensión de navegador que muestra localmente cómo aparece el navegador en Internet: sus direcciones IPv4/IPv6 públicas, el país de salida y la organización de red.

## Datos tratados

La extensión contacta servicios externos para determinar las direcciones IPv4 e IPv6 públicas del navegador. Después envía dichas direcciones a un servicio GeoIP para determinar el país y la organización de red.

La versión actual usa:

- `api.ipify.org` para IPv4 pública;
- `api6.ipify.org` para IPv6 pública;
- `api.ipapi.is` para país, ASN y organización de red.
- `ipwho.is` para la consulta opcional de región y ciudad, solo cuando el usuario activa este ajuste.

## Datos no recopilados

IP Flag no solicita ni accede al historial de navegación, URL visitadas, contenido de páginas, cookies, búsquedas, contraseñas, datos de cuenta ni ubicación precisa del dispositivo.

La extensión no usa análisis, publicidad, telemetría, sincronización en la nube ni un backend operado por el desarrollador.

## Almacenamiento local y transferencia

El estado de red actual, las preferencias seleccionadas y una pequeña caché GeoIP se almacenan solo en el almacenamiento local de la extensión. La caché se conserva hasta tres días y contiene como máximo 50 direcciones IP.

Una dirección IP pública se envía a los servicios indicados únicamente para la función principal de la extensión y mediante HTTPS.

## Cambios en esta política

Esta página se actualizará con una nueva versión de la extensión si el tratamiento de datos cambia de forma significativa.
