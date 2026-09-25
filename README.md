# 🚚 LogiTrack Express — Servidor Backend (Fase 2)

¡Bienvenido a la **Fase 2** del proyecto **LogiTrack Express**! 

En esta etapa migramos el prototipo desde una persistencia local en el navegador (`localStorage`) hacia una arquitectura profesional cliente-servidor, utilizando **Python**, **Flask** y una base de datos relacional en **SQLite**.

---

## 🔗 Referencia a la Fase 1 (Frontend)

- **Repositorio Prototipo Frontend (Fase 1):** [logistica-envios](https://github.com/sergiogimenezclass/logistica-envios)
- **Resguardo Local JS:** El código JavaScript autónomo de la Fase 1 se encuentra disponible en [`app_fase1.js`](file:///home/sergio/Documents/src/programador%202026/logistica-envio-server/app_fase1.js) para consultar y restaurar funciones de interfaz a medida que las conectemos con el backend.

---

## 🎯 Objetivos de la Fase 2

1. **Servidor Web REST con Flask:** Construir la aplicación backend en Python (`app.py`).
2. **Base de Datos Relacional SQLite:** Reemplazar `localStorage` por una base de datos física `database.db`.
3. **Endpoints RESTful:** Exponer endpoints para operaciones CRUD de envíos.
4. **Geocodificación y Lógica en Servidor:** Integrar peticiones a servicios externos (ej. Nominatim) desde el backend cuando corresponda.
5. **Conexión Frontend - Backend:** Refactorizar `app.js` para consumir la API mediante `fetch()` asíncrono.

---

## 📁 Estructura del Proyecto

```text
logistica-envios-servidor-2/
├── app.py               # Servidor principal Flask y API REST
├── test_app.py          # Suite de pruebas unitarias
├── database.db          # Base de datos SQLite (se genera en la inicialización)
├── doc/                 # Documentación pedagógica
│   ├── contexto.md      # Especificación técnica del proyecto
│   └── pasos_fase2.md   # Guía detallada de baby steps y tests
├── templates/
│   └── index.html       # Maqueta semántica HTML5 servida por render_template()
├── static/
│   ├── css/
│   │   └── styles.css   # Estilos CSS Vainilla en /static/css/styles.css
│   └── js/
│       ├── app.js       # Código JavaScript de Fase 2 en /static/js/app.js
│       └── app_fase1.js # Resguardo de código JS cliente de la Fase 1
└── README.md            # Documentación general del proyecto
```

---

## 🗄️ Esquema de Base de Datos (`database.db`)

La tabla `envios` almacena la información necesaria para el portal de rastreo y el panel de operador:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Identificador único del envío |
| `tracking_code` | `TEXT UNIQUE NOT NULL` | Código de seguimiento (ej: `AR-1001`) |
| `recipient` | `TEXT NOT NULL` | Nombre y apellido del destinatario |
| `address` | `TEXT NOT NULL` | Dirección de entrega |
| `status` | `TEXT NOT NULL` | Estado (`En preparación`, `En camino`, `Entregado`) |
| `package_type` | `TEXT NOT NULL` | Tipo de servicio |
| `pin` | `TEXT NOT NULL` | PIN de seguridad de 4 dígitos |
| `lat` | `REAL` | Latitud obtenida por geocodificación |
| `lon` | `REAL` | Longitud obtenida por geocodificación |
| `created_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | Fecha de creación del registro |

---

## 🌐 Endpoints de la API REST (`/api/envios`)

| Método | Endpoint | Descripción | Body / Params |
| --- | --- | --- | --- |
| `GET` | `/api/envios` | Obtener la lista completa de paquetes | N/A |
| `GET` | `/api/envios/<tracking_code>` | Buscar paquete por código de guía | N/A |
| `POST` | `/api/envios` | Registrar un nuevo despacho | JSON `{ recipient, address, package_type, ... }` |
| `PUT` | `/api/envios/<id>` | Actualizar estado o datos de un envío | JSON con campos a actualizar |
| `DELETE` | `/api/envios/<id>` | Eliminar un envío de la base de datos | N/A |

---

## 🤖 Guía Didáctica: Prompts Paso a Paso para la Fase 2

### 🔹 Paso 1: Inicialización del Servidor Flask y SQLite
> "Crea el archivo `app.py` en Python con Flask. Configura la conexión a la base de datos SQLite `database.db` y crea la tabla `envios` si no existe. Agrega una ruta raíz `/` que sirva el archivo `index.html` y una ruta para servir archivos estáticos."

### 🔹 Paso 2: Endpoint GET para Consultar Envíos
> "En `app.py`, implementa los endpoints `GET /api/envios` (lista completa en formato JSON) y `GET /api/envios/<tracking_code>` (búsqueda individual para el portal de cliente). Incluye registros semilla iniciales si la tabla está vacía."

### 🔹 Paso 3: Endpoints POST, PUT y DELETE (CRUD Completo)
> "Agrega en `app.py` los endpoints `POST /api/envios` para crear un envío, `PUT /api/envios/<id>` para actualizar el estado/datos y `DELETE /api/envios/<id>` para eliminarlo."

### 🔹 Paso 4: Conexión del Frontend (`app.js`) con la API
> "Refactoriza `app.js` reemplazando las funciones de `localStorage` por peticiones `fetch()` asíncronas hacia la API en Flask para cargar la tabla de operador y realizar la búsqueda en el portal de rastreo."
