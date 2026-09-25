# 🚚 LogiTrack Express — Sistema Integral de Paquetería, Distribución y Trazabilidad Logística

¡Hola! En este proyecto vas a construir **LogiTrack Express**, una aplicación web interactiva que simula un sistema profesional de seguimiento de paquetería y gestión de distribución logística (inspirado en plataformas como Andreani, Correo Argentino y FedEx).

El proyecto combina dos caras operativas fundamentales en una misma interfaz desacoplada:

1. **Portal Público de Rastreo (Vista Cliente):** Enfocado en la experiencia del usuario final, con estética corporativa (púrpura `#4D148C` y naranja `#FF6200`), seguimiento satelital de la unidad en vivo sobre mapas viales reales, cotizador de fletes troncales y validación de entrega con PIN secreto de 4 dígitos.
2. **Panel de Tráfico y Despacho (Vista Operador):** Enfocado en la gestión operativa interna, con métricas en tiempo real, formulario de despacho (Alta y Edición) y planilla maestra tipo CRUD con filtrado en vivo y rótulos oficiales imprimibles con código QR.

El trabajo tiene dos caminos posibles:

- **Usar la maqueta resuelta** y concentrarse en la lógica y consumo de APIs con JavaScript.
- **Construir la maqueta desde cero** con HTML y CSS vainilla, y después agregar JavaScript paso a paso.

En ambos casos, la interactividad se programa en **pasos progresivos (baby steps)**: una funcionalidad por vez, probada antes de avanzar a la siguiente, con ayuda de un asistente de inteligencia artificial.

---

> 📌 **Fase 2 — Desarrollo Backend con Python (Flask) y SQLite**
> 
> Este repositorio corresponde a la **Fase 2** del proyecto. El objetivo actual es construir un servidor RESTful utilizando **Python**, **Flask** y una base de datos relacional **SQLite** (`database.db`) para reemplazar la persistencia estática en `localStorage` y centralizar la gestión de datos.
> 
> 🔗 **Versión anterior (Fase 1 - Prototipo 100% Frontend):** Podés consultar la versión previa orientada exclusivamente al cliente (HTML5, CSS Vainilla y JS autónomo) en el repositorio original [logistica-envios](https://github.com/sergiogimenezclass/logistica-envios). Además, en este proyecto podés encontrar el código JavaScript completo de la Fase 1 guardado en [`app_fase1.js`](file:///home/sergio/Documents/src/programador%202026/logistica-envio-server/app_fase1.js).

---

## 🛠️ Las tres partes del proyecto

Una página web se divide en tres capas fundamentales:

```text
┌──────────────────────────────────────────────────────────┐
│ 1. HTML (index.html) ──► Estructura y contenido          │
│ 2. CSS  (styles.css) ──► Presentación y diseño vainilla  │
│ 3. JS   (app.js)     ──► Comportamiento y consumo APIs   │
└──────────────────────────────────────────────────────────┘
```

### 1. HTML: La Estructura (`index.html`)

El archivo `index.html` contiene la maqueta semántica del proyecto:

- **Cabecera Institucional:** Barra superior con isotipo y conmutador de vistas (*Portal Rastreo* / *Operador de Tráfico*).
- **Banner de Búsqueda (Hero Tracker):** Buscador principal de números de guía con sugerencias de rastreo rápido.
- **Tarjeta de Manifiesto de Envío:** Muestra el número de guía oficial, estado actual, destinatario, tipo de servicio y PIN de seguridad.
- **Simulador Satelital de Tránsito:** Barra de progreso porcentual, cálculo de ETA y controles de reproducción (*Iniciar*, *Pausar*, *Reiniciar* y velocidades *1x, 3x, 8x, 16x*).
- **Línea de Tiempo Dinámica (Timeline):** Historial detallado de 4 hitos operativos (*Ingreso en Planta*, *Tránsito Troncal*, *Última Milla*, *Entrega Finalizada*).
- **Cotizador Troncal Nacional:** Calculadora de tarifas estimadas y tiempos de tránsito según ciudad y peso del bulto.
- **Contenedor del Mapa Interactivo:** Lienzo donde se renderiza el mapa satelital Leaflet y las trazas viales.
- **Panel de Métricas del Operador:** Tarjetas de contadores (*Total*, *En preparación*, *En camino*, *Entregados*).
- **Formulario de Despacho (CRUD):** Formulario para registrar o editar envíos con geocodificación automática.
- **Planilla Maestra de Registros:** Tabla interactiva con búsqueda/filtrado en vivo y botones de acción (*Rastrear*, *Rótulo*, *Editar*, *Eliminar*).
- **Ventanas Modales:** Modal de verificación de PIN secreto y Modal de rótulo logístico con código QR imprimible.

### 2. CSS: El Diseño Vainilla (`styles.css`)

El proyecto utiliza una hoja de estilos escrita en **CSS Vainilla puro**, sin librerías externas ni utilidades de Tailwind CSS:

- **Sin frameworks ni librerías externas:** Todo el diseño está construido nativamente.
- **Variables CSS (`:root`):** Manejo centralizado de colores corporativos (FedEx Purple `#4D148C`, FedEx Orange `#FF6200`, grises Carbon y estados semánticos).
- **Layout General con CSS Grid:** Disposición estructural de la página completa, grillas de vistas de 2 columnas (`.client-grid`, `.operator-grid`) y tarjeta de métricas (`.metrics-grid`).
- **Layout de Componentes con Flexbox:** Distribución interna de la barra de navegación, buscador, tarjetas, controles del simulador, formulario y ventanas modales.
- **Unidades Didácticas Exclusivas:** Medidas expresadas estrictamente en píxeles (`px`) y porcentajes (`%`).

### 3. JavaScript: La Funcionalidad (`app.js`)

El archivo `app.js` maneja la interactividad y la integración de servicios:

- **Persistencia en LocalStorage:** Guarda y recupera los envíos bajo la clave `logitrack_shipments_v3` con botón de restauración a datos semilla.
- **Integración de Mapa Interactivo (Leaflet.js):** Renderiza el lienzo interactivo utilizando la capa pública de **OpenStreetMap** (libre, 100% gratuita y sin API Key ni marcas de agua).
- **Geocodificación Asíncrona (Nominatim API):** Convierte direcciones de texto ingresadas en el formulario en coordenadas `lat` y `lon` mediante `fetch`.
- **Ruteo Vial Calle por Calle (OSRM Routing Engine API):** Consulta el trazado real sobre la red de calles entre el Hub Central (Tapiales, PBA) y la dirección de destino.
- **Animación del Vehículo (Camioncito 🚚):** Anima el movimiento punto por punto sobre la traza vial con selección de velocidad acelerada.
- **Mecánica de Seguridad de PIN de Entrega:** Al llegar al 100% del recorrido, el vehículo se detiene y exige validar un PIN de 4 dígitos para autorizar el estado *"Entregado"*.
- **Generación de Códigos QR al Vuelo:** Consulta la API externa de QR Server para generar códigos QR escaneables en el rótulo logístico imprimible.

---

## 📁 Estructura de Archivos del Proyecto

```text
logistica-envios/
├── index.html       # Estructura HTML5 semántica y contenedores de vistas
├── styles.css       # Hoja de estilos en CSS Vainilla (Grid & Flexbox, px y %)
├── app.js           # Lógica JavaScript (Leaflet, Nominatim, OSRM, CRUD, localStorage)
├── contexto.md      # Especificación técnica y documento pedagógico de traspaso
└── README.md        # Guía de integración y secuencia de prompts para IA
```

Los archivos están conectados en `index.html`:

```html
<link rel="stylesheet" href="styles.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="app.js"></script>
```

---

## 🏷️ Convenciones de Nombres y Selectores (DOM)

Para que JavaScript interactúe correctamente con la interfaz, se utilizan los siguientes identificadores y clases:

| Elemento | Selector | Descripción |
| --- | --- | --- |
| Pestaña Cliente | `#tab-client` | Botón para cambiar al Portal de Rastreo |
| Pestaña Operador | `#tab-operator` | Botón para cambiar al Panel de Tráfico |
| Vista Cliente | `#view-client` | Contenedor principal de la vista de cliente |
| Vista Operador | `#view-operator` | Contenedor principal de la vista de operador |
| Input de Búsqueda | `#search-tracking-input` | Campo para ingresar número de guía a rastrear |
| Botón Rastrear | `#btn-search-tracking` | Botón que activa la búsqueda del envío |
| Píldoras Rápidas | `#quick-demo-pills` | Contenedor dinámico de guías de muestra |
| Código de Guía | `#client-tracking-code` | Etiqueta con el número de seguimiento activo |
| Muestra de PIN | `#client-pin-display` | Bloque que exhibe el PIN de liberación |
| Botón Play/Pausa | `#btn-sim-play` | Control de reproducción de la simulación |
| Barra de Progreso | `#sim-progress-bar` | Relleno porcentual del recorrido del camión |
| Botones Velocidad | `.sim-speed-btn` | Botones de aceleración (`data-speed="1|3|8|16"`) |
| Contenedor Timeline | `#timeline-container` | Lista dinámicamente generada de hitos viales |
| Lienzo del Mapa | `#map-container` | Div contenedor del mapa de Leaflet |
| Formulario Envío | `#shipment-form` | Formulario de alta/edición de paquetes |
| Tabla de Envíos | `#shipments-table-body` | Cuerpo de la planilla maestra CRUD |
| Filtro de Tabla | `#table-filter-input` | Campo de búsqueda en vivo sobre la tabla |
| Modal de PIN | `#pin-modal` | Cuadro de diálogo para verificar PIN de recepción |
| Input de PIN | `#pin-input-code` | Campo numérico de 4 dígitos en el modal |
| Modal Rótulo QR | `#label-modal` | Ventana emergente con el rótulo imprimible |
| Imagen QR | `#lbl-qr-img` | Etiqueta `<img>` donde se carga el QR generado |

---

## 🤖 Guía Didáctica: Prompts Paso a Paso para Construir la Aplicación con IA

A continuación tenés la secuencia ordenada de **prompts** que podés copiar y pegar en un asistente de Inteligencia Artificial para construir la aplicación desde cero de forma pedagógica.

---

### 🔹 Paso 1: Estructura HTML5 Semántica Base

> **Prompt 1:**
> "Crea el archivo `index.html` para una aplicación de logística y paquetería llamada LogiTrack Express. Incluye una cabecera con logotipo y dos pestañas para cambiar entre 'Portal Rastreo' (Cliente) y 'Operador de Tráfico'. En la vista de cliente, crea la estructura para un buscador de guías, una tarjeta de manifiesto con estado y PIN, controles de simulación, línea de tiempo (timeline), cotizador de fletes y un contenedor `#map-container`. En la vista de operador, incluye 4 tarjetas de métricas, un formulario de alta/edición de envíos y una tabla de registros con filtro de texto. Agrega dos modales: uno para validar un PIN de 4 dígitos y otro para mostrar un rótulo de despacho imprimible. Incluye la librería Leaflet CSS/JS por CDN y vincula los archivos local `styles.css` y `app.js`."

---

### 🔹 Paso 2: Sistema de Diseño en CSS Vainilla (Grid & Flexbox)

> **Prompt 2:**
> "Crea el archivo `styles.css` utilizando exclusivamente CSS Vainilla (sin Tailwind ni librerías). Define variables CSS en `:root` para una paleta basada en FedEx (Púrpura `#4D148C`, Naranja `#FF6200`, grises Carbon y estados semánticos). El layout general debe estar estructurado con CSS Grid (`.app-root`, `.main-container`, `.client-grid`, `.operator-grid`, `.metrics-grid`), mientras que la disposición interna de cada componente debe usar Flexbox. Utiliza únicamente píxeles (`px`) y porcentajes (`%`) para todas las dimensiones y márgenes. Incluye estilos para tarjetas, formularios, botones, tabla, badges de estado, barra de progreso con gradiente y ventanas modales."

---

### 🔹 Paso 3: Persistencia en LocalStorage y Datos Semilla

> **Prompt 3:**
> "Crea el archivo `app.js` e implementa la lógica de persistencia de datos. Define un arreglo de envíos semilla iniciales con campos `id`, `trackingCode`, `recipient`, `address`, `status`, `packageType`, `pin`, `lat` y `lon`. Escribe la función `loadShipmentsFromStorage()` para leer los datos desde `localStorage` bajo la clave `logitrack_shipments_v3` (inicializando con las semillas si no existen datos) y la función `saveShipmentsToStorage()` para guardar los cambios. Agrega una función `showToast(message, type)` para notificaciones emergentes."

---

### 🔹 Paso 4: Navegación entre Vistas y Gestión de Roles

> **Prompt 4:**
> "En `app.js`, escribe la función global `switchRole(role)` que permita conmutar la visibilidad entre la vista `#view-client` y `#view-operator`. Al activar cada vista, actualiza las clases CSS de los botones del conmutador (`.nav-btn-active` / `.nav-btn-inactive`) y ejecuta `map.invalidateSize()` con un pequeño timeout para forzar la correcta renderización del lienzo del mapa en pantalla."

---

### 🔹 Paso 5: Mapa Interactivo con Leaflet (OpenStreetMap Libre)

> **Prompt 5:**
> "En `app.js`, implementa la función `setupMap()` para inicializar el mapa de Leaflet en el elemento `#map-container`. Configura las coordenadas centradas en Buenos Aires (`-34.6037, -58.3816`) con zoom 12 y utiliza la capa de mosaicos pública de OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`), la cual es 100% libre y no requiere API Key. Escribe también la función `refreshMapMarkers()` para renderizar en el mapa los marcadores de cada envío guardado con íconos de colores según su estado."

---

### 🔹 Paso 6: Geocodificación Asíncrona de Direcciones (Nominatim API)

> **Prompt 6:**
> "Agrega en `app.js` la función asíncrona `geocodeAddress(queryAddress)`. Debe realizar una petición `fetch` a la API gratuita de Nominatim OpenStreetMap (`https://nominatim.openstreetmap.org/search?format=json&q=...`) enviando la dirección en texto. Si encuentra resultados, debe retornar un objeto `{ lat, lon }` parseado a flotantes. Si la API falla o no encuentra coincidencia, debe incluir un mecanismo de fallback con coordenadas aleatorias en el área metropolitana."

---

### 🔹 Paso 7: Motor de Ruteo Vial Calle por Calle (OSRM Routing API)

> **Prompt 7:**
> "Escribe la función asíncrona `fetchRoadRoute(start, end)` en `app.js`. Debe consultar el motor de ruteo de OSRM (`https://router.project-osrm.org/route/v1/driving/lon1,lat1;lon2,lat2?overview=full&geometries=geojson`) para calcular la trayectoria sobre calles reales entre el Hub Logístico Central (Tapiales) y las coordenadas de destino. La función debe retornar un objeto con el arreglo de coordenadas del camino (`path`), la distancia en kilómetros (`distanceKm`) y el tiempo estimado en minutos (`durationMin`)."

---

### 🔹 Paso 8: Simulador Satelital de Vehículo (Camioncito 🚚)

> **Prompt 8:**
> "Implementa en `app.js` la función `selectShipmentForSimulation(item)`. Debe limpiar capas anteriores, colocar marcadores visuales para el Hub, el Destino y el Vehículo (camioncito 🚚), dibujar la polilínea de la ruta calculada por OSRM y ajustar la vista del mapa (`fitBounds`). Escribe el motor de animación con `setInterval` en las funciones `startSimulation()`, `pauseSimulation()`, `stopSimulation()` y `toggleSimulation()`, permitiendo acelerar la marcha según los botones de velocidad (`1x, 3x, 8x, 16x`). Actualiza dinámicamente la barra de progreso porcentual."

---

### 🔹 Paso 9: Línea de Tiempo Dinámica (Timeline)

> **Prompt 9:**
> "Agrega la función `renderTimeline(percentage)` en `app.js`. Debe recibir el porcentaje de progreso del recorrido (0 a 100%) y renderizar en `#timeline-container` cuatro hitos operativos: 'Ingreso en Planta Central', 'En Tránsito Troncal', 'Última Milla en Curso' y 'Entrega Finalizada'. Cada hito debe actualizar sus colores e íconos (completado `✓`, activo en naranja o pendiente en gris) según el avance del vehículo."

---

### 🔹 Paso 10: Validación por PIN Secreto y Mecánica de Entrega

> **Prompt 10:**
> "Cuando el vehículo alcance el 100% del trayecto en la simulación, debe detenerse y abrir automáticamente el modal `#pin-modal` solicitando el PIN de 4 dígitos. Escribe las funciones `openPinModal(shipment)`, `closePinModal()` y `validateDeliveryPin()`. Si el PIN ingresado coincide con el del paquete, cierra el modal, cambia el estado del paquete a 'Entregado', actualiza la tabla/mapa y muestra un aviso toast de confirmación. Si el PIN es incorrecto, muestra un mensaje de error y anima el campo con una clase de vibración (`animate-shake`)."

---

### 🔹 Paso 11: Cotizador Troncal Nacional de Tarifas

> **Prompt 11:**
> "En `app.js`, añade el evento para el botón `#btn-calculate-quote`. Debe tomar la ciudad ingresada y el peso seleccionado, geocodificar la ciudad con `geocodeAddress`, calcular la distancia en km mediante `fetchRoadRoute` contra el Hub Central y determinar el costo total combinando una tarifa base ($3500), costo por km ($120/km) y costo por peso ($400/kg). Muestra el resultado en la tarjeta `#quote-result-card` especificando el nivel de servicio (FedEx Priority, Express Saver o Domestic Ground)."

---

### 🔹 Paso 12: Panel de Operador con Registro y Tabla CRUD

> **Prompt 12:**
> "Escribe en `app.js` la función `renderShipmentsTable(filterText)` para poblar la tabla `#shipments-table-body`. Debe incluir filtrado en vivo por texto (código, cliente o dirección), insígnias de estado y botones de acción en cada fila (`Rastrear`, `Rótulo`, `Editar`, `Eliminar`). Implementa la función `deleteShipment(id)`, la función `prepareEdit(id)` para cargar los datos en el formulario y el manejo del evento `submit` de `#shipment-form` para procesar el Alta o Edición con geocodificación automática."

---

### 🔹 Paso 13: Rótulo Logístico Imprimible con Código QR Dinámico

> **Prompt 13:**
> "Implementa las funciones `openLabelModal(shipmentId)` y `closeLabelModal()`. Debe cargar en el modal `#label-modal` los datos del paquete (guía, destinatario, dirección, PIN y servicio) y generar dinámicamente un código QR escaneable realizando una petición a la API de QR Server (`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=...`). Incluye un botón para disparar la impresión directa del rótulo mediante `window.print()`."

---

### 🔹 Paso 14: Migración a Backend con Python, Flask y SQLite (Fase 2)

> **Prompt 14:**
> "Diseña la migración del proyecto hacia un backend relacional en Python con Flask. Crea un archivo `app.py` que configure un servidor web servido por Flask, inicialice una base de datos SQLite `database.db` con la tabla `envios` y exponga los endpoints RESTful: `GET /api/envios`, `GET /api/envios/<tracking_code>`, `POST /api/envios`, `PUT /api/envios/<id>` y `DELETE /api/envios/<id>`. Refactoriza las llamadas de `app.js` para reemplazar la lectura/escritura en `localStorage` por peticiones asíncronas `fetch('/api/...')` hacia la API en Flask."

---

## 💡 Recomendaciones Didácticas

1. **Desarrollo Incremental:** Probá la aplicación en el navegador después de ejecutar cada prompt antes de pasar al siguiente.
2. **Inspección de Consola:** Utilizá la consola del navegador (`F12`) para verificar que las peticiones `fetch` a Nominatim, OSRM y QR Server respondan correctamente.
3. **Persistencia Local:** Podés usar el botón *"Restablecer datos fábrica"* en el panel de operador si querés reiniciar la base de datos local en `localStorage`.
