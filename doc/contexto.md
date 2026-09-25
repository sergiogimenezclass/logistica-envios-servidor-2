# LogiTrack Express — Documento de Traspaso Técnico y Pedagógico

## 1. Visión General del Proyecto
**LogiTrack Express** es una aplicación web interactiva que simula un sistema integral de paquetería, distribución y trazabilidad logística (inspirado en plataformas como Andreani, Correo Argentino y FedEx). 

El proyecto combina dos caras operativas fundamentales en una misma interfaz desacoplada:
1. **Portal Público de Rastreo (Vista Cliente):** Enfocado en la experiencia del usuario final, con estética corporativa inspirada en FedEx (púrpura `#4D148C` y naranja `#FF6200`), seguimiento satelital de la unidad en vivo sobre mapas viales reales, cotizador troncal y validación de entrega con PIN secreto.
2. **Panel de Tráfico y Despacho (Vista Operador):** Enfocado en la gestión operativa interna, con estética utilitaria y minimalista (estilo terminal/herramienta interna), métricas en tiempo real, formulario de despacho y planilla maestra tipo CRUD.

---

## 2. Objetivos Pedagógicos
Este proyecto forma parte de un curso formativo de programación web y backend. La estrategia didáctica se diseñó en **dos fases progresivas**:

### Fase 1 (Estado Actual): Prototipo Funcional 100% Frontend
* **Objetivo:** Que los estudiantes dominen la manipulación del DOM, el consumo asíncrono de APIs REST externas mediante `fetch` (`async/await`), el manejo de estado en el cliente, la persistencia local con `localStorage` y la integración de librerías geoespaciales (Leaflet).
* **Valor didáctico:** Permite ver el ciclo completo de una aplicación real (altas, bajas, modificaciones, geolocalización y renderizado dinámico) sin lidiar todavía con la complejidad de un servidor web.

### Fase 2 (Siguiente Paso): Migración a Backend con Python (Flask) y SQLite
* **Objetivo:** Reemplazar la persistencia en `localStorage` y las llamadas directas desde JavaScript por una API REST construida en Python con el microframework **Flask** y una base de datos relacional en **SQLite**.
* **Conceptos a enseñar:**
  * Diseño de esquemas de bases de datos relacionales (`paquetes`, `estados`, `historial_movimientos`).
  * Endpoints RESTful (`GET /api/shipments`, `POST /api/shipments`, `PUT /api/shipments/<id>`, `DELETE /api/shipments/<id>`).
  * Consumo de APIs de terceros desde el backend en Python usando la librería `requests` (ej. geocodificación en el servidor antes de guardar en la base de datos).
  * Desacoplamiento Frontend / Backend (el frontend existente consumirá la API de Flask vía JSON).

---

## 3. Stack Tecnológico Actual (Frontend Autónomo)

* **Estructura y Lenguajes:** HTML5, CSS3 Vainilla, JavaScript Vanilla (ES6+ asíncrono).
* **Estilos y Maquetación:** CSS Vainilla estructurado con **CSS Grid** para la maquetación general y **Flexbox** para la disposición de componentes.
* **Tipografías:** Google Fonts (*Plus Jakarta Sans* para interfaz general y *JetBrains Mono* para códigos de guía, PINs y valores numéricos).
* **Librería Cartográfica:** [Leaflet.js](https://leafletjs.com/) v1.9.4.
* **Capa de Mosaicos (Tiles):** OpenStreetMap Estándar (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`), 100% gratuito, público y sin requerimiento de API Key ni marcas de agua.

---

## 4. Servicios Externos y APIs Integradas (Gratuitas y sin API Key)

1. **Geocodificación (Dirección $\rightarrow$ Coordenadas):**
   * **Servicio:** OpenStreetMap Nominatim API.
   * **Endpoint:** `https://nominatim.openstreetmap.org/search?format=json&q={direccion}`
   * **Uso:** Al cargar o editar un paquete en el formulario, se georreferencia automáticamente la dirección para obtener `lat` y `lon`. Cuenta con fallback automático en caso de timeout o bloqueo.
2. **Ruteo Vial Calle por Calle (Routing Engine):**
   * **Servicio:** OSRM (Open Source Routing Machine).
   * **Endpoint:** `https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson`
   * **Uso:** Calcula la trayectoria real sobre calles, autopistas y rutas entre el Hub Central de Logística (ubicado por defecto en Tapiales/Mercado Central, PBA) y la dirección destino del paquete. Retorna los puntos geométricos del camino, la distancia real en kilómetros y el tiempo estimado.
3. **Generación de Códigos QR al Vuelo:**
   * **Servicio:** QR Server API.
   * **Endpoint:** `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={payload}`
   * **Uso:** Genera el QR dinámico en el rótulo oficial de despacho para lectura en sucursal.

---

## 5. Módulos y Funcionalidades Principales

### A. Vista de Cliente (Portal de Seguimiento FedEx)
* **Buscador Hero de Guías:** Input de tracking con sugerencias rápidas en píldoras (ej: `AR-1001`, `AR-2045`).
* **Tarjeta Oficial de Manifiesto:** Muestra el número de guía, estado, destinatario, dirección normalizada y tipo de servicio.
* **Simulador Satelital de Unidad (Camioncito 🚚):**
  * Desplaza el marcador del vehículo punto a punto sobre la traza vial provista por OSRM.
  * Controles de reproducción: *Iniciar*, *Pausar*, *Reiniciar* y velocidades aceleradas (*1x, 3x, 8x, 16x*).
  * Cámara con seguimiento inteligente (`map.panTo`) y ajuste a ruta completa (`fitBounds`).
  * Barra de progreso porcentual y cálculo dinámico de ETA.
* **Línea de Tiempo Dinámica (Timeline):** Cuatro hitos operativos (*Ingreso a Planta*, *Tránsito Troncal*, *Última Milla*, *Entrega Finalizada*) que actualizan su estado visual según el progreso del móvil.
* **PIN de Seguridad (Mecánica de Entrega Segura):**
  * Cada envío genera un PIN secreto de 4 dígitos para el destinatario.
  * Cuando el vehículo arriba al destino (100%), se detiene la marcha y se abre automáticamente un modal de verificación. Si el PIN ingresado coincide, el paquete cambia formalmente a estado `"Entregado"`.
* **Cotizador Troncal Nacional:**
  * Permite calcular cotizaciones en base al destino y rango de peso.
  * Geocodifica la ciudad ingresada, consulta la distancia real en km contra el Hub y calcula la tarifa combinando costo base, tarifa por km y adicional por peso.

### B. Vista de Operador (Tráfico y CRUD de Envíos)
* **Barra de Métricas:** Contadores en tiempo real de paquetes *Totales*, *En preparación*, *En camino* y *Entregados*.
* **Formulario de Despacho (Create / Update):**
  * Asignación automática o manual de código de seguimiento y PIN de 4 dígitos.
  * Geocodificación asíncrona de domicilios en segundo plano con spinner de carga.
* **Planilla Maestra de Despachos (Read / Delete):**
  * Tabla con filtrado en vivo por texto.
  * Acciones por fila: *Rastrear* (cambia a la vista de cliente y enfoca la ruta), *Rótulo*, *Editar* y *Eliminar*.
* **Rótulo Logístico de Despacho Imprimible:**
  * Modal adaptado para impresión (`@media print` y `window.print()`).
  * Incluye datos de remitente/hub, destinatario, código de barras simulado, PIN de recepción y código QR interactivo.
* **Persistencia en `localStorage`:** 
  * Los envíos se guardan bajo la clave `logitrack_shipments_v3`.
  * Incluye botón para restablecer a los datos semilla de prueba (*Seed Data*).

---

## 6. Modelo de Datos (Esquema de Objeto Actual)

Cada envío dentro del arreglo de datos posee la siguiente estructura:

```json
{
  "id": 1,
  "trackingCode": "AR-1001",
  "recipient": "Lucía Fernández",
  "address": "Av. Corrientes 1350, San Nicolás, CABA",
  "status": "En camino",
  "packageType": "FedEx Express Standard",
  "pin": "4921",
  "lat": -34.6044,
  "lon": -58.3871
}
```

---

## 7. Próximos Pasos Sugeridos para la Siguiente IA / Desarrollador

Para avanzar hacia la **Fase 2 (Backend con Python y Flask)**, se recomienda seguir este orden de trabajo:

1. **Creación del Entorno Flask:**
   * Archivo principal `app.py` o módulo `server/`.
   * Estructurar el proyecto con carpetas `templates/` (para servir el HTML) y `static/` (para CSS/JS si se decide modularizar).
2. **Base de Datos SQLite (`database.db`):**
   * Crear la tabla relacional `envios` con tipos de datos adecuados (`INTEGER PRIMARY KEY`, `TEXT`, `REAL` para coordenadas).
   * Opcional nivel 2: Crear tabla relacional `eventos_tracking` para registrar fecha, hora y descripción de cada cambio de estado (relación 1 a N).
3. **Construcción de la API REST en Python:**
   * `GET /api/envios`: Devuelve la lista completa de paquetes.
   * `GET /api/envios/<tracking_code>`: Devuelve el paquete para la vista de cliente.
   * `POST /api/envios`: Recibe el formulario, hace la consulta a Nominatim con `requests` y persiste en SQLite.
   * `PUT /api/envios/<id>`: Actualiza estado o datos del paquete.
   * `DELETE /api/envios/<id>`: Elimina un registro de la base de datos.
4. **Refactorización del Frontend:**
   * Reemplazar las funciones que interactúan con `localStorage` por llamadas `fetch('/api/...')` asíncronas hacia el servidor local en Flask.