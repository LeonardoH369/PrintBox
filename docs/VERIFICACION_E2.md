# Verificación de Evidencia 2

Ejecución local: 24 de octubre de 2026, Windows, Node.js 24.19.0 y MySQL Community Server 8.4.9. Se usó una instancia temporal en loopback, puerto 33317, con bases desechables `printbox_e2_test` y `printbox_verify_test`. No se modificaron bases ni servicios existentes.

## Ejecutado

- `npm ci`: instalación desde el lockfile.
- Revisión de sintaxis de archivos JavaScript con `node --check`.
- Las dos migraciones aplicadas correctamente sobre una base vacía; segunda base nueva utilizada para la comprobación final.
- `npm test` con `RUN_DB_TESTS=true`: **7 pruebas aprobadas, 0 fallidas, 0 omitidas**. Son seis pruebas unitarias y una prueba HTTP de integración con múltiples comprobaciones.
- Integración: denegación de rutas privadas y HTML administrativo sin sesión; login; cookie HttpOnly; ocultación de hashes; separación ADMIN/OPERATOR; creación y edición de usuarios y pedidos; historial y precios históricos; rechazo de saltos de estado y de en ruta sin foto; dos evidencias persistentes; seguimiento público sin nombre del cliente; archivo y recuperación sin segundo movimiento de stock; dos solicitudes concurrentes por una unidad (una aceptada, una rechazada); rollback del stock de una primera línea cuando otra línea del pedido falla; cuenta desactivada y logout invalidan sesiones; protección del último administrador activo.
- Creación de administrador por script, sin imprimir la contraseña.
- Seeder E2 ejecutado dos veces sobre la misma base, sin duplicar sus pedidos.
- Recorrido real en Chromium mediante automatización: redirección al login, acceso al dashboard, alta de usuario, creación de pedido, avance por todos los estados con dos imágenes, consulta pública de entrega e imagen decodificada, vista móvil de 390 px sin desbordamiento y sin errores JavaScript.
- Capturas de dashboard, seguimiento y móvil inspeccionadas visualmente. Las fotos del recorrido fueron imágenes mínimas de prueba, no entregas reales. Las capturas temporales no se versionan ni sustituyen las que el estudiante debe obtener.
- Auditoría de dependencias: se actualizaron body-parser y fast-uri dentro de los rangos compatibles del árbol existente. Después, `npm audit --omit=dev` reportó **0 altas, 0 críticas y 2 entradas moderadas** (uuid y su dependencia ascendente Sequelize).

## Límites y pendientes

- No se ejecutó la aplicación contra MariaDB ni dentro de XAMPP. La prueba realizada fue contra MySQL 8.4. No confundir compatibilidad esperada con ejecución comprobada.
- El recorrido automatizado seleccionó archivos PNG; la captura desde cámara física depende del teléfono, navegador y permisos y debe comprobarse en el dispositivo del estudiante.
- Las fotografías se guardan en base y se validan por tamaño, MIME y firma. No se implementó un servicio de análisis de contenido ni recodificación de imágenes.
- El folio aleatorio actúa como clave de consulta pública: quien lo conozca puede ver estado y foto final. No debe difundirse en capturas públicas con fotografías privadas.
- El límite de login está en memoria por proceso, adecuado al entorno local de esta entrega; un despliegue con varias instancias necesitaría un mecanismo compartido.
- La alerta moderada pendiente de uuid es [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq). La auditoría propone bajar Sequelize a 3.x; no se aplicó esa sustitución incompatible. No se afirma ausencia de vulnerabilidades.
- No se ha comprobado despliegue público, HTTPS, recuperación de contraseña ni envío de correos. No hay checkout ni pagos.
- La edición de pedidos cubre cliente y descripción, no sustitución de líneas. El archivado conserva stock y no equivale a cancelación.

El código cubre la demostración funcional descrita en el README. La aprobación académica y cualquier uso productivo requieren su revisión correspondiente.
