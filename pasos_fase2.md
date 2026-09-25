# 🐾 Guía Detallada de Baby Steps y Pruebas Unitarias — Fase 2

Este documento especifica la **Fase 2** dividida en **baby steps** (micro-pasos independientes). Cada baby step incluye su desarrollo y su correspondiente **Test Unitario Automatizado** en `test_app.py`.

---

## 🔹 Bloque 1: Servidor Flask Base y Archivos Estáticos

### 🐾 Baby Step 1.1: Preparación del entorno y creación de `app.py`
- **Desarrollo:** Instancia básica de Flask en `app.py`.
- **Test Unitario:** `test_baby_step_1_1_app_exists` en `test_app.py`.
- **Verificación:** `python3 -m unittest test_app.py` valida que `app` sea un objeto Flask válido.

### 🐾 Baby Step 1.2: Configuración de la ruta raíz (`/`)
- **Desarrollo:** Decorador `@app.route('/')` sirviendo `index.html` mediante `send_from_directory`.
- **Test Unitario:** `test_baby_step_1_2_root_route` en `test_app.py`.
- **Verificación:** Valida `status_code == 200` y presencia del encabezado `<!DOCTYPE html>`.

### 🐾 Baby Step 1.3: Servicio de archivos estáticos (`styles.css`, `app.js`)
- **Desarrollo:** Configuración de `static_folder='.'` y `static_url_path=''` en `app.py`.
- **Test Unitario:** `test_baby_step_1_3_static_files` en `test_app.py`.
- **Verificación:** Valida `status_code == 200` para `/styles.css` y `/app.js`.

### 🐾 Baby Step 1.4: Lanzamiento y prueba en puerto 5000
- **Desarrollo:** Ejecución de `app.run(host='0.0.0.0', port=5000)`.
- **Test de Integración:** Petición HTTP directa al puerto 5000 con `curl` o cliente test.
- **Verificación:** Valida respuesta del servidor en vivo en `http://localhost:5000`.

---

## 🔹 Bloque 2: Base de Datos SQLite e Inicialización

### 🐾 Baby Step 2.1: Conexión a SQLite
- **Desarrollo:** Función `get_db_connection()` en `app.py`.
- **Test Unitario:** `test_baby_step_2_1_db_connection`.
- **Verificación:** Valida que la conexión retorne una instancia `sqlite3.Connection`.

### 🐾 Baby Step 2.2: Esquema de la tabla `envios`
- **Desarrollo:** Función `init_db()` ejecutando el SQL `CREATE TABLE IF NOT EXISTS envios`.
- **Test Unitario:** `test_baby_step_2_2_table_schema`.
- **Verificación:** Consulta la tabla `sqlite_master` y verifica la existencia de todas las columnas.

### 🐾 Baby Step 2.3: Inserción de datos semilla
- **Desarrollo:** Carga de semillas iniciales (`AR-1001`, `AR-2045`, `AR-3089`) si la tabla está vacía.
- **Test Unitario:** `test_baby_step_2_3_seed_data`.
- **Verificación:** Consulta `SELECT COUNT(*) FROM envios` y verifica al menos 3 registros.

### 🐾 Baby Step 2.4: Auto-inicialización al iniciar Flask
- **Desarrollo:** Invocación de `init_db()` dentro de la inicialización de la app.
- **Test Unitario:** `test_baby_step_2_4_auto_init`.
- **Verificación:** Recrea una BD en memoria y comprueba la creación automática de tablas y semillas.

---

## 🔹 Bloque 3: Endpoint `GET /api/envios`

### 🐾 Baby Step 3.1: Implementación del Endpoint `GET /api/envios`
- **Desarrollo:** Ruta `@app.route('/api/envios', methods=['GET'])` retornando la lista en JSON.
- **Test Unitario:** `test_baby_step_3_1_get_all_shipments`.
- **Verificación:** Comprueba `status_code == 200`, estructura JSON array y campos obligatorios (`tracking_code`, `recipient`, `status`).

---

## 🔹 Bloque 4: Carga de Tabla en Frontend (`app.js`)

### 🐾 Baby Step 4.1 a 4.4: Conexión Frontend con API REST
- **Desarrollo:** `app.js` restaurando UI e integrando `fetch('/api/envios')`.
- **Test Unitario:** `test_baby_step_4_frontend_api_contract`.
- **Verificación:** Pruebas unitarias de contrato API y renderizado web en navegador.

---

## 🔹 Bloque 5: Buscador del Cliente (`GET /api/envios/<tracking_code>`)

### 🐾 Baby Step 5.1 a 5.4: Búsqueda individual y Simulación
- **Desarrollo:** Endpoint `GET /api/envios/<tracking_code>` y conexión con buscador cliente.
- **Test Unitario:** `test_baby_step_5_1_get_single_shipment` y `test_baby_step_5_1_not_found` (404).
- **Verificación:** Valida retorno correcto ante guías existentes y respuesta 404 ante guías inexistentes.

---

## 🔹 Bloque 6: Alta de Envíos (`POST /api/envios`)

### 🐾 Baby Step 6.1 a 6.3: Registro de Envíos
- **Desarrollo:** Endpoint `POST /api/envios` en `app.py` y conexión del formulario en `app.js`.
- **Test Unitario:** `test_baby_step_6_1_create_shipment` (201 Created) y `test_baby_step_6_1_invalid_data` (400 Bad Request).
- **Verificación:** Valida inserción real en SQLite y respuesta JSON con ID asignado.

---

## 🔹 Bloque 7: Edición y Validación de PIN (`PUT /api/envios/<id>`)

### 🐾 Baby Step 7.1 a 7.4: Actualización y Entrega
- **Desarrollo:** Endpoint `PUT /api/envios/<id>` y conexión con modal de PIN y edición.
- **Test Unitario:** `test_baby_step_7_1_update_shipment`.
- **Verificación:** Valida cambio de estado a `"Entregado"` en SQLite.

---

## 🔹 Bloque 8: Eliminación (`DELETE /api/envios/<id>`)

### 🐾 Baby Step 8.1 a 8.3: Borrado de Registros
- **Desarrollo:** Endpoint `DELETE /api/envios/<id>` y conexión del botón eliminar.
- **Test Unitario:** `test_baby_step_8_1_delete_shipment`.
- **Verificación:** Valida la eliminación del registro en SQLite y retorno HTTP 200/204.
