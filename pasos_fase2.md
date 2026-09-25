# 🐾 Guía Detallada de Baby Steps — Fase 2 (Servidor Flask + SQLite)

Este documento contiene la planificación detallada de la **Fase 2** dividida en **baby steps** (micro-pasos independientes). Cada paso explica su objetivo, los archivos involucrados y la forma de verificar su correcto funcionamiento.

---

## 🔹 Bloque 1: Servidor Flask Base y Archivos Estáticos

### 🐾 Baby Step 1.1: Preparación del entorno y creación de `app.py`
- **Objetivo:** Verificar la disponibilidad del paquete `flask` en Python y crear el archivo `app.py` con la estructura inicial.
- **Archivos:** `app.py`
- **Verificación:** Ejecutar `python3 -c "import flask"` y confirmar la presencia del archivo `app.py`.

### 🐾 Baby Step 1.2: Configuración de la ruta raíz (`/`)
- **Objetivo:** Definir en `app.py` el endpoint `/` que responda entregando el archivo `index.html`.
- **Archivos:** `app.py`
- **Verificación:** Realizar una solicitud a la ruta raíz y validar que retorne el HTML semántico de la aplicación.

### 🐾 Baby Step 1.3: Servicio de archivos estáticos (`styles.css`, `app.js`)
- **Objetivo:** Configurar Flask para servir los activos estáticos (hoja de estilos CSS y scripts JavaScript) de forma correcta.
- **Archivos:** `app.py`
- **Verificación:** Solicitar `/styles.css` y `/app.js` mediante `curl` o navegador y recibir respuesta HTTP 200 OK.

### 🐾 Baby Step 1.4: Lanzamiento y prueba del servidor web
- **Objetivo:** Levantar el servidor Flask en el puerto `5000` y comprobar la navegación en `http://localhost:5000`.
- **Archivos:** `app.py`
- **Verificación:** Acceder desde la interfaz web a `http://localhost:5000` y comprobar que la maqueta cargue sin errores en consola.

---

## 🔹 Bloque 2: Base de Datos SQLite e Inicialización

### 🐾 Baby Step 2.1: Función auxiliar de conexión a SQLite
- **Objetivo:** Escribir la función `get_db_connection()` en `app.py` para abrir la base de datos `database.db` configurando el retorno de filas como diccionarios (`sqlite3.Row`).
- **Archivos:** `app.py`
- **Verificación:** Ejecutar una consulta de prueba desde Python sin errores de conexión.

### 🐾 Baby Step 2.2: Creación del esquema de la tabla `envios`
- **Objetivo:** Crear la tabla `envios` si no existe al iniciar la aplicación (`CREATE TABLE IF NOT EXISTS envios...`).
- **Archivos:** `app.py`, `database.db`
- **Campos:** `id`, `tracking_code`, `recipient`, `address`, `status`, `package_type`, `pin`, `lat`, `lon`, `created_at`.
- **Verificación:** Inspeccionar `database.db` con SQLite y confirmar la existencia de la tabla y sus columnas.

### 🐾 Baby Step 2.3: Inserción de datos semilla iniciales
- **Objetivo:** Poblar la tabla `envios` con los datos semilla de prueba (ej: `AR-1001`, `AR-2045`, `AR-3089`) en caso de que la tabla esté vacía.
- **Archivos:** `app.py`, `database.db`
- **Verificación:** Consultar la tabla `envios` y verificar que contenga los registros iniciales.

### 🐾 Baby Step 2.4: Inicialización automática al arrancar Flask
- **Objetivo:** Invocar la función de inicialización de la base de datos dentro del arranque principal de `app.py`.
- **Archivos:** `app.py`
- **Verificación:** Borrar `database.db` (si existiera), iniciar `python3 app.py` y verificar que se cree e inicialice automáticamente.

---

## 🔹 Bloque 3: Consultar Envíos (`GET /api/envios`)

### 🐾 Baby Step 3.1: Creación del endpoint `GET /api/envios`
- **Objetivo:** Definir la ruta API en Flask que lea todos los registros de la tabla `envios` y devuelva un JSON estructurado.
- **Archivos:** `app.py`
- **Verificación:** Ejecutar una consulta SQL `SELECT * FROM envios` y transformar el resultado con `jsonify()`.

### 🐾 Baby Step 3.2: Validación HTTP del endpoint `GET /api/envios`
- **Objetivo:** Probar la respuesta JSON del endpoint mediante `curl` o cliente HTTP.
- **Archivos:** N/A (Prueba externa)
- **Verificación:** Ejecutar `curl -i http://localhost:5000/api/envios` y verificar encabezado `Content-Type: application/json` y array de paquetes.

---

## 🔹 Bloque 4: Carga de Tabla en Frontend (`app.js`)

### 🐾 Baby Step 4.1: Restauración de funciones base de interfaz
- **Objetivo:** Recuperar de `app_fase1.js` e incluir en `app.js` las funciones para cambio de pestañas (`switchRole`) e inicialización del mapa Leaflet (`setupMap`).
- **Archivos:** `app.js` (usando referencias de `app_fase1.js`)
- **Verificación:** Probar que los botones de pestañas (*Portal Cliente* / *Operador*) funcionen en la interfaz.

### 🐾 Baby Step 4.2: Restauración de renderizado visual de tabla y métricas
- **Objetivo:** Traer las funciones `renderShipmentsTable()` y `updateMetrics()` a `app.js`.
- **Archivos:** `app.js`
- **Verificación:** Validar que la estructura de renderizado HTML de la tabla y las tarjetas de contadores esté presente en el código.

### 🐾 Baby Step 4.3: Conexión asíncrona `fetch('/api/envios')`
- **Objetivo:** Escribir la función `loadShipmentsFromAPI()` que consulte el endpoint `GET /api/envios` y envíe los datos a las funciones de renderizado.
- **Archivos:** `app.js`
- **Verificación:** Cargar la página web en el navegador y verificar que la tabla del operador se llene con los datos servidos por SQLite.

---

## 🔹 Bloque 5: Buscador del Cliente (`GET /api/envios/<tracking_code>`)

### 🐾 Baby Step 5.1: Endpoint `GET /api/envios/<tracking_code>`
- **Objetivo:** Crear el endpoint REST para buscar un envío específico por su código de seguimiento.
- **Archivos:** `app.py`
- **Verificación:** Consultar `curl http://localhost:5000/api/envios/AR-1001` y recibir el objeto JSON correspondiente (o 404 si no existe).

### 🐾 Baby Step 5.2: Conexión del buscador en el Portal de Cliente
- **Objetivo:** Asignar el evento al botón de búsqueda y a las píldoras de demostración en `app.js` para consultar el endpoint `GET /api/envios/<code_guia>`.
- **Archivos:** `app.js`
- **Verificación:** Escribir un número de guía en la interfaz de cliente y verificar que se traiga la información desde el servidor.

### 🐾 Baby Step 5.3: Restauración de la simulación del camioncito 🚚
- **Objetivo:** Copiar de `app_fase1.js` la lógica del motor de animación sobre el mapa (`selectShipmentForSimulation`, `startSimulation`, polilíneas OSRM y velocidad).
- **Archivos:** `app.js`
- **Verificación:** Seleccionar un envío y comprobar el movimiento del vehículo sobre la ruta.

---

## 🔹 Bloque 6: Alta de Envíos (`POST /api/envios`)

### 🐾 Baby Step 6.1: Endpoint `POST /api/envios`
- **Objetivo:** Implementar la recepción de nuevos envíos en Flask mediante `request.get_json()`, asignación de PIN de 4 dígitos e inserción en SQLite.
- **Archivos:** `app.py`
- **Verificación:** Enviar una petición `POST` con `curl` conteniendo datos JSON de un paquete nuevo y verificar que devuelva código HTTP 201 Created.

### 🐾 Baby Step 6.2: Conexión del formulario de despacho (Operador)
- **Objetivo:** Asociar el envío del formulario `#shipment-form` en `app.js` para realizar un `fetch('/api/envios', { method: 'POST', ... })`.
- **Archivos:** `app.js`
- **Verificación:** Completar el formulario de despacho desde la web, presionar "Registrar Despacho" y comprobar la actualización automática de la tabla.

---

## 🔹 Bloque 7: Actualización de Estado y PIN (`PUT /api/envios/<id>`)

### 🐾 Baby Step 7.1: Endpoint `PUT /api/envios/<id>`
- **Objetivo:** Crear la ruta REST en `app.py` para actualizar datos o cambiar el estado de un envío por su ID.
- **Archivos:** `app.py`
- **Verificación:** Enviar un `PUT` con `curl` modificando el estado de un paquete y verificar su persistencia en la base de datos.

### 🐾 Baby Step 7.2: Validación por PIN y cambio de estado
- **Objetivo:** Conectar la ventana modal de PIN en `app.js` para que al ingresar el PIN correcto se envíe una petición `PUT` actualizando el estado a `"Entregado"`.
- **Archivos:** `app.js`
- **Verificación:** Completar la simulación al 100%, ingresar el PIN de 4 dígitos y verificar que el estado cambie a "Entregado" en la base de datos.

### 🐾 Baby Step 7.3: Edición de envíos existentes
- **Objetivo:** Cargar los datos de un envío en el formulario al presionar "Editar" y enviar la actualización vía `PUT` a la API.
- **Archivos:** `app.js`
- **Verificación:** Editar la dirección o destinatario de un paquete desde el panel de operador y confirmar el cambio.

---

## 🔹 Bloque 8: Eliminación de Envíos (`DELETE /api/envios/<id>`)

### 🐾 Baby Step 8.1: Endpoint `DELETE /api/envios/<id>`
- **Objetivo:** Crear el endpoint REST en `app.py` para eliminar un registro de la tabla `envios` por su ID.
- **Archivos:** `app.py`
- **Verificación:** Enviar `curl -X DELETE http://localhost:5000/api/envios/1` y comprobar que el registro sea eliminado de SQLite.

### 🐾 Baby Step 8.2: Conexión del botón "Eliminar" en la tabla
- **Objetivo:** Vincular la acción de eliminación en cada fila de la tabla en `app.js` con el endpoint `DELETE`.
- **Archivos:** `app.js`
- **Verificación:** Hacer clic en "Eliminar" en una fila de la tabla, confirmar el aviso emergente y verificar que la fila desaparezca y no vuelva a cargar.
