/* ==========================================================================
   LogiTrack Express — Lógica Principal de la Aplicación (Fase 2 Backend REST API)
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. CONFIGURACIÓN INICIAL Y HUB CENTRAL
// --------------------------------------------------------------------------

// Coordenadas del Hub Logístico Central (Mercado Central / Tapiales, PBA)
const LOGISTIC_HUB = {
    name: "Centro Logístico Central Tapiales",
    lat: -34.7082,
    lon: -58.4988
};

// Arreglo global de envíos en memoria
let shipments = [];

/**
 * Normaliza las propiedades de un envío proveniente del backend SQL / JSON.
 */
function normalizeShipment(item) {
    if (!item) return null;
    return {
        id: item.id,
        trackingCode: item.tracking_code || item.trackingCode,
        recipient: item.recipient,
        address: item.address,
        status: item.status,
        packageType: item.package_type || item.packageType || "FedEx Express Standard",
        pin: item.pin,
        lat: item.lat,
        lon: item.lon,
        created_at: item.created_at
    };
}

/**
 * Carga los envíos guardados realizando una petición HTTP GET a la API Flask (/api/envios).
 */
async function loadShipmentsFromBackend() {
    try {
        const response = await fetch('/api/envios');
        if (response.ok) {
            const data = await response.json();
            shipments = data.map(normalizeShipment);
            return shipments;
        }
    } catch (e) {
        console.error("Error al cargar envíos desde la API backend:", e);
    }
    return [];
}

// --------------------------------------------------------------------------
// 2. ESTADO GLOBAL DE MAPAS Y SIMULACIÓN
// --------------------------------------------------------------------------

let map = null;
let markersLayer = null;
let currentRoutePolyline = null;
let currentTruckMarker = null;
let currentHubMarker = null;
let destinationMarker = null;

let simulationInterval = null;
let isSimulating = false;
let simulationSpeed = 1;
let simulationRoutePoints = [];
let currentRouteStepIndex = 0;
let activeSimulatedShipment = null;

// --------------------------------------------------------------------------
// 3. REFERENCIAS A ELEMENTOS DEL DOM
// --------------------------------------------------------------------------

const tabClient = document.getElementById("tab-client");
const tabOperator = document.getElementById("tab-operator");
const viewClient = document.getElementById("view-client");
const viewOperator = document.getElementById("view-operator");

const clientTrackingCode = document.getElementById("client-tracking-code");
const clientRecipient = document.getElementById("client-recipient");
const clientStatusBadge = document.getElementById("client-status-badge");
const clientAddress = document.getElementById("client-address");
const clientPackageType = document.getElementById("client-package-type");
const clientPinDisplay = document.getElementById("client-pin-display");
const btnShowLabelClient = document.getElementById("btn-show-label-client");

const shipmentForm = document.getElementById("shipment-form");
const editIdInput = document.getElementById("edit-id");
const trackingCodeInput = document.getElementById("tracking-code");
const recipientInput = document.getElementById("recipient");
const addressInput = document.getElementById("address");
const statusSelect = document.getElementById("status");
const packageTypeSelect = document.getElementById("package-type");
const packagePinInput = document.getElementById("package-pin");
const btnGenerateCode = document.getElementById("btn-generate-code");
const btnResetStorage = document.getElementById("btn-reset-storage");
const tableFilterInput = document.getElementById("table-filter-input");

const formTitle = document.getElementById("form-title");
const formBadge = document.getElementById("form-badge");
const btnSubmit = document.getElementById("btn-submit");
const btnSubmitText = document.getElementById("btn-submit-text");
const btnSpinner = document.getElementById("btn-spinner");
const btnCancel = document.getElementById("btn-cancel");
const tableBody = document.getElementById("shipments-table-body");
const counterBadge = document.getElementById("counter-badge");

const statTotal = document.getElementById("stat-total");
const statPrep = document.getElementById("stat-prep");
const statTransit = document.getElementById("stat-transit");
const statDelivered = document.getElementById("stat-delivered");

const searchInput = document.getElementById("search-tracking-input");
const btnSearch = document.getElementById("btn-search-tracking");
const btnResetMap = document.getElementById("btn-reset-map");
const simTrackingId = document.getElementById("sim-tracking-id");
const simRouteInfo = document.getElementById("sim-route-info");
const btnSimPlay = document.getElementById("btn-sim-play");
const btnSimPlayIcon = document.getElementById("btn-sim-play-icon");
const btnSimPlayText = document.getElementById("btn-sim-play-text");
const btnSimReset = document.getElementById("btn-sim-reset");
const simProgressBar = document.getElementById("sim-progress-bar");
const simProgressText = document.getElementById("sim-progress-text");
const simEtaText = document.getElementById("sim-eta-text");
const timelineContainer = document.getElementById("timeline-container");
const speedButtons = document.querySelectorAll(".sim-speed-btn");
const quickDemoPills = document.getElementById("quick-demo-pills");

const quoteDestination = document.getElementById("quote-destination");
const quoteWeight = document.getElementById("quote-weight");
const btnCalculateQuote = document.getElementById("btn-calculate-quote");
const quoteResultCard = document.getElementById("quote-result-card");
const quoteDistance = document.getElementById("quote-distance");
const quoteSla = document.getElementById("quote-sla");
const quoteTotalPrice = document.getElementById("quote-total-price");

const pinModal = document.getElementById("pin-modal");
const pinModalTracking = document.getElementById("pin-modal-tracking");
const pinInputCode = document.getElementById("pin-input-code");
const pinErrorMsg = document.getElementById("pin-error-msg");
const btnValidatePin = document.getElementById("btn-validate-pin");

const labelModal = document.getElementById("label-modal");
const lblTracking = document.getElementById("lbl-tracking");
const lblTrackingSub = document.getElementById("lbl-tracking-sub");
const lblQrImg = document.getElementById("lbl-qr-img");
const lblPin = document.getElementById("lbl-pin");
const lblBarcode = document.getElementById("lbl-barcode");
const lblRecipient = document.getElementById("lbl-recipient");
const lblAddress = document.getElementById("lbl-address");
const lblPackageType = document.getElementById("lbl-package-type");
const lblDate = document.getElementById("lbl-date");

// --------------------------------------------------------------------------
// 4. NAVEGACIÓN Y CONMUTACIÓN DE VISTAS (ROLES)
// --------------------------------------------------------------------------

window.switchRole = function (role) {
    if (role === 'client') {
        viewClient.classList.remove("hidden");
        viewClient.classList.add("grid");
        viewOperator.classList.add("hidden");
        viewOperator.classList.remove("grid");

        tabClient.className = "nav-btn nav-btn-active";
        tabOperator.className = "nav-btn nav-btn-inactive";

        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                if (currentRoutePolyline) {
                    map.fitBounds(currentRoutePolyline.getBounds(), { padding: [40, 40] });
                }
            }
        }, 150);
    } else {
        viewOperator.classList.remove("hidden");
        viewOperator.classList.add("grid");
        viewClient.classList.add("hidden");
        viewClient.classList.remove("grid");

        updateOperatorStats();
    }
};

// --------------------------------------------------------------------------
// 5. FUNCIONES AUXILIARES Y GENERADORES
// --------------------------------------------------------------------------

function generateRandomPin() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateRandomTracking() {
    return "AR-" + Math.floor(1000 + Math.random() * 9000).toString();
}

function renderQuickDemoPills() {
    if (!quickDemoPills) return;
    quickDemoPills.innerHTML = '<span style="color: #e9d5ff; font-weight: 700;">Rastreo rápido:</span>' +
        shipments.slice(0, 4).map(s => `
  <button onclick="quickSearchDemo('${s.trackingCode}')" class="pill-btn">
    ${s.trackingCode}
  </button>
`).join("");
}

window.quickSearchDemo = function (code) {
    searchInput.value = code;
    selectShipmentForSimulationByCode(code);
};

function updateOperatorStats() {
    statTotal.textContent = shipments.length;
    statPrep.textContent = shipments.filter(s => s.status === "En preparación").length;
    statTransit.textContent = shipments.filter(s => s.status === "En camino").length;
    statDelivered.textContent = shipments.filter(s => s.status === "Entregado").length;
}

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");

    const styles = {
        success: "toast-success",
        error: "toast-error",
        info: "toast-info",
        warning: "toast-warning"
    };

    toast.className = `toast-msg opacity-0 ${styles[type] || styles.info}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("opacity-0");
    }, 20);

    setTimeout(() => {
        toast.classList.add("opacity-0");
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

// --------------------------------------------------------------------------
// 6. INTEGRACIÓN GEOESPACIAL Y MAPAS (LEAFLET + NOMINATIM + OSRM)
// --------------------------------------------------------------------------

function setupMap() {
    map = L.map("map-container", {
        zoomControl: true
    }).setView([-34.6037, -58.3816], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contribuyentes'
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    refreshMapMarkers();

    if (shipments.length > 0) {
        selectShipmentForSimulation(shipments[0]);
    }
}

async function geocodeAddress(queryAddress) {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryAddress)}`;

    try {
        const response = await fetch(endpoint, {
            headers: { "Accept-Language": "es" }
        });

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lon: parseFloat(data[0].lon)
                };
            }
        }
    } catch (err) {
        console.warn("Geocodificación con fallback:", err);
    }

    return {
        lat: -34.6037 + (Math.random() - 0.5) * 0.08,
        lon: -58.3816 + (Math.random() - 0.5) * 0.08
    };
}

async function fetchRoadRoute(start, end) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;

    try {
        const res = await fetch(url);
        if (res.ok) {
            const json = await res.json();
            if (json.routes && json.routes.length > 0) {
                const rawCoords = json.routes[0].geometry.coordinates;
                const path = rawCoords.map(c => [c[1], c[0]]);
                const distanceKm = (json.routes[0].distance / 1000).toFixed(1);
                const durationMin = Math.round(json.routes[0].duration / 60);
                return { path, distanceKm, durationMin };
            }
        }
    } catch (err) {
        console.warn("OSRM no disponible, usando interpolación de ruta directa:", err);
    }

    const steps = 100;
    const fallbackPath = [];
    for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const curve = Math.sin(ratio * Math.PI) * 0.007;
        const lat = start.lat + (end.lat - start.lat) * ratio + curve;
        const lon = start.lon + (end.lon - start.lon) * ratio;
        fallbackPath.push([lat, lon]);
    }

    return { path: fallbackPath, distanceKm: "6.8", durationMin: 22 };
}

// --------------------------------------------------------------------------
// 7. MOTOR DE SIMULACIÓN SATELITAL Y CONTROL DE RUTA
// --------------------------------------------------------------------------

async function selectShipmentForSimulation(item) {
    stopSimulation();
    activeSimulatedShipment = item;

    clientTrackingCode.textContent = item.trackingCode;
    clientRecipient.textContent = item.recipient;
    clientAddress.textContent = item.address;
    clientPackageType.textContent = item.packageType || "FedEx Express Standard";
    clientStatusBadge.innerHTML = getStatusBadgeHtml(item.status);
    clientPinDisplay.textContent = item.pin;

    simTrackingId.textContent = `Guía ${item.trackingCode}`;
    simRouteInfo.textContent = `Calculando ruta hacia ${item.address}...`;
    simProgressBar.style.width = "0%";
    simProgressText.textContent = "0%";
    currentRouteStepIndex = 0;

    if (currentRoutePolyline) map.removeLayer(currentRoutePolyline);
    if (currentTruckMarker) map.removeLayer(currentTruckMarker);
    if (currentHubMarker) map.removeLayer(currentHubMarker);
    if (destinationMarker) map.removeLayer(destinationMarker);

    const hubIcon = L.divIcon({
        className: "custom-hub-icon",
        html: `<div style="background-color: var(--color-fedex-purple); color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-family: var(--font-mono); font-weight: 700; box-shadow: var(--shadow-subtle); border: 1px solid #e9d5ff;">HUB CENTRAL</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, 10]
    });
    currentHubMarker = L.marker([LOGISTIC_HUB.lat, LOGISTIC_HUB.lon], { icon: hubIcon }).addTo(map);

    const destIcon = L.divIcon({
        className: "custom-dest-icon",
        html: `<div style="background-color: var(--color-fedex-orange); color: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-family: var(--font-mono); font-weight: 700; box-shadow: var(--shadow-subtle); border: 1px solid #ffedd5;">DESTINO</div>`,
        iconSize: [64, 20],
        iconAnchor: [32, 10]
    });
    destinationMarker = L.marker([item.lat, item.lon], { icon: destIcon }).addTo(map);

    const truckIcon = L.divIcon({
        className: "custom-truck-icon",
        html: `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: var(--color-fedex-orange); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: var(--shadow-card); border: 2px solid #ffffff;">🚚</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
    currentTruckMarker = L.marker([LOGISTIC_HUB.lat, LOGISTIC_HUB.lon], { icon: truckIcon }).addTo(map);

    const routeData = await fetchRoadRoute(LOGISTIC_HUB, item);
    simulationRoutePoints = routeData.path;

    simRouteInfo.textContent = `${routeData.distanceKm} km · Tránsito regular (~${routeData.durationMin} min)`;
    simEtaText.textContent = `ETA: ~${routeData.durationMin} min`;

    currentRoutePolyline = L.polyline(simulationRoutePoints, {
        color: "#4D148C",
        weight: 4,
        opacity: 0.9,
        lineCap: "round"
    }).addTo(map);

    map.fitBounds(currentRoutePolyline.getBounds(), { padding: [40, 40] });

    renderTimeline(0);
    btnSimPlayText.textContent = "Iniciar";
    btnSimPlayIcon.textContent = "▶";
}

function renderTimeline(percentage) {
    const p = Math.round(percentage);
    const isPart1 = p >= 0;
    const isPart2 = p >= 25;
    const isPart3 = p >= 75;
    const isPart4 = p >= 100;

    const items = [
        {
            title: "Ingreso en Planta Central",
            desc: "Paquete clasificado y asignado al móvil.",
            active: isPart1,
            done: isPart2,
            time: "08:15"
        },
        {
            title: "En Tránsito Troncal",
            desc: "Desplazándose por red vial hacia la zona de entrega.",
            active: isPart2,
            done: isPart3,
            time: isPart2 ? "09:40" : "—"
        },
        {
            title: "Última Milla en Curso",
            desc: "Móvil en proximidad de destino. Preparar PIN.",
            active: isPart3,
            done: isPart4,
            time: isPart3 ? "11:20" : "—"
        },
        {
            title: "Entrega Finalizada",
            desc: isPart4 ? "PIN validado en mano. Paquete entregado." : "Aguardando verificación de PIN.",
            active: isPart4,
            done: isPart4,
            time: isPart4 ? "12:05" : "—"
        }
    ];

    timelineContainer.innerHTML = items.map((it) => `
<div class="timeline-item">
  <div style="position: absolute; left: 0px; top: 6px; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-family: var(--font-mono); font-weight: 700; transition: all 0.2s ease; ${
      it.done
        ? 'background-color: var(--color-fedex-purple); color: #ffffff;'
        : it.active
            ? 'background-color: var(--color-fedex-orange); color: #ffffff;'
            : 'background-color: var(--color-carbon-200); color: var(--color-carbon-400);'
  }">
    ${it.done ? '✓' : ''}
  </div>
  <div style="flex: 1;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <h4 style="font-size: 12px; font-weight: 700; color: ${it.active ? 'var(--color-carbon-950)' : 'var(--color-carbon-400)'};">${it.title}</h4>
      <span style="font-size: 10px; font-family: var(--font-mono); font-weight: 700; color: var(--color-carbon-400);">${it.time}</span>
    </div>
    <p style="font-size: 11px; color: ${it.active ? 'var(--color-carbon-600)' : 'var(--color-carbon-400)'}; margin-top: 2px; line-height: 1.4;">${it.desc}</p>
  </div>
</div>
`).join("");
}

function toggleSimulation() {
    if (!simulationRoutePoints || simulationRoutePoints.length === 0) return;

    if (isSimulating) {
        pauseSimulation();
    } else {
        startSimulation();
    }
}

function startSimulation() {
    if (currentRouteStepIndex >= simulationRoutePoints.length - 1) {
        currentRouteStepIndex = 0;
    }

    isSimulating = true;
    btnSimPlayIcon.textContent = "⏸";
    btnSimPlayText.textContent = "Pausar";

    const baseIntervalMs = Math.max(20, Math.floor(140 / simulationSpeed));

    clearInterval(simulationInterval);
    simulationInterval = setInterval(() => {
        if (currentRouteStepIndex < simulationRoutePoints.length) {
            const currentPoint = simulationRoutePoints[currentRouteStepIndex];
            currentTruckMarker.setLatLng(currentPoint);

            const progress = (currentRouteStepIndex / (simulationRoutePoints.length - 1)) * 100;
            simProgressBar.style.width = `${progress}%`;
            simProgressText.textContent = `${Math.round(progress)}%`;

            renderTimeline(progress);

            if (currentRouteStepIndex % 8 === 0) {
                map.panTo(currentPoint, { animate: true, duration: 0.3 });
            }

            currentRouteStepIndex++;
        } else {
            arriveAtDestinationPromptPin();
        }
    }, baseIntervalMs);
}

function pauseSimulation() {
    isSimulating = false;
    clearInterval(simulationInterval);
    btnSimPlayIcon.textContent = "▶";
    btnSimPlayText.textContent = "Continuar";
}

function stopSimulation() {
    isSimulating = false;
    clearInterval(simulationInterval);
    currentRouteStepIndex = 0;
    if (btnSimPlayIcon) btnSimPlayIcon.textContent = "▶";
    if (btnSimPlayText) btnSimPlayText.textContent = "Iniciar";
}

function arriveAtDestinationPromptPin() {
    stopSimulation();
    simProgressBar.style.width = "99%";
    simProgressText.textContent = "En puerta";
    showToast("Móvil en destino. Requiere PIN de seguridad", "warning");
    openPinModal(activeSimulatedShipment);
}

// --------------------------------------------------------------------------
// 8. MECANISMO DE VERIFICACIÓN Y LIBERACIÓN POR PIN
// --------------------------------------------------------------------------

function openPinModal(shipment) {
    if (!shipment) return;
    pinModalTracking.textContent = `${shipment.trackingCode} — ${shipment.recipient}`;
    pinInputCode.value = "";
    pinErrorMsg.classList.add("hidden");
    pinModal.classList.remove("hidden");
    pinModal.classList.add("flex");
    setTimeout(() => pinInputCode.focus(), 100);
}

function closePinModal() {
    pinModal.classList.add("hidden");
    pinModal.classList.remove("flex");
}

function validateDeliveryPin() {
    if (!activeSimulatedShipment) return;
    const entered = pinInputCode.value.trim();

    if (entered === activeSimulatedShipment.pin) {
        closePinModal();
        completeSimulation();
    } else {
        pinErrorMsg.classList.remove("hidden");
        pinInputCode.classList.add("border-rose-500", "animate-shake");
        setTimeout(() => pinInputCode.classList.remove("animate-shake"), 500);
    }
}

function completeSimulation() {
    simProgressBar.style.width = "100%";
    simProgressText.textContent = "100%";
    renderTimeline(100);

    if (activeSimulatedShipment) {
        activeSimulatedShipment.status = "Entregado";
        clientStatusBadge.innerHTML = getStatusBadgeHtml("Entregado");
        renderShipmentsTable();
        refreshMapMarkers();
        updateOperatorStats();
        showToast(`Envío ${activeSimulatedShipment.trackingCode} entregado formalmente`, "success");
    }
}

// --------------------------------------------------------------------------
// 9. GENERACIÓN Y VISUALIZACIÓN DE RÓTULOS CON CÓDIGO QR
// --------------------------------------------------------------------------

window.openLabelModal = function (shipmentId) {
    const item = shipments.find(s => s.id === shipmentId) || activeSimulatedShipment;
    if (!item) return;

    lblTracking.textContent = item.trackingCode;
    lblTrackingSub.textContent = item.trackingCode;
    lblRecipient.textContent = item.recipient;
    lblAddress.textContent = item.address;
    lblPackageType.textContent = item.packageType || "FedEx Express Standard";
    lblPin.textContent = item.pin || "0000";
    lblDate.textContent = new Date().toLocaleDateString("es-AR");

    const qrData = `LOGITRACK:${item.trackingCode}|DEST:${item.recipient}|PIN:${item.pin}`;
    lblQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    labelModal.classList.remove("hidden");
    labelModal.classList.add("flex");
};

window.closeLabelModal = function () {
    labelModal.classList.add("hidden");
    labelModal.classList.remove("flex");
};

// --------------------------------------------------------------------------
// 10. GESTIÓN DE PLANILLA MAESTRA DE DESPACHOS (CRUD)
// --------------------------------------------------------------------------

function refreshMapMarkers() {
    if (!markersLayer) return;
    markersLayer.clearLayers();

    const bounds = [];

    shipments.forEach(item => {
        if (!item.lat || !item.lon) return;

        const markerColor = item.status === "Entregado" ? "#10b981" : (item.status === "En camino" ? "#FF6200" : "#f59e0b");

        const customIcon = L.divIcon({
            className: "custom-pin",
            html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0px 1px 4px rgba(0,0,0,0.25);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        const marker = L.marker([item.lat, item.lon], { icon: customIcon });

        const popupContent = `
  <div style="font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
    <div style="font-family: var(--font-mono); font-weight: 700; color: var(--color-carbon-950);">${item.trackingCode}</div>
    <div style="color: var(--color-carbon-600); font-weight: 500;">${item.recipient}</div>
    <div style="color: var(--color-carbon-500); font-size: 11px;">${item.address}</div>
    <div style="padding-top: 6px; display: flex; gap: 4px;">
      <button onclick="selectShipmentForSimulationByCode('${item.trackingCode}')" class="btn-table-action" style="background-color: var(--color-fedex-purple); color: #ffffff; border: none;">Simular</button>
      <button onclick="openLabelModal(${item.id})" class="btn-table-action">Rótulo</button>
    </div>
  </div>
`;

        marker.bindPopup(popupContent);
        marker.addTo(markersLayer);
        bounds.push([item.lat, item.lon]);
    });

    if (bounds.length > 0 && !isSimulating) {
        bounds.push([LOGISTIC_HUB.lat, LOGISTIC_HUB.lon]);
    }
}

function getStatusBadgeHtml(status) {
    switch (status) {
        case "En preparación":
            return `<span class="badge-status badge-prep">En preparación</span>`;
        case "En camino":
            return `<span class="badge-status badge-transit">En tránsito</span>`;
        case "Entregado":
            return `<span class="badge-status badge-delivered">Entregado</span>`;
        case "Cancelado":
            return `<span class="badge-status badge-canceled">Cancelado</span>`;
        default:
            return `<span class="badge-status" style="background-color: var(--color-carbon-100); color: var(--color-carbon-800);">${status}</span>`;
    }
}

function renderShipmentsTable(filterText = "") {
    tableBody.innerHTML = "";

    const filtered = shipments.filter(s => {
        const query = filterText.toLowerCase();
        return (s.trackingCode && s.trackingCode.toLowerCase().includes(query)) ||
            (s.recipient && s.recipient.toLowerCase().includes(query)) ||
            (s.address && s.address.toLowerCase().includes(query));
    });

    counterBadge.textContent = `${filtered.length} de ${shipments.length} envíos`;
    updateOperatorStats();

    if (filtered.length === 0) {
        tableBody.innerHTML = `
  <tr>
    <td colspan="5" style="padding: 32px; text-align: center; color: var(--color-carbon-400); font-family: var(--font-mono); font-size: 12px;">
      Sin registros coincidentes.
    </td>
  </tr>
`;
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
  <td style="font-family: var(--font-mono); font-weight: 600; color: var(--color-carbon-950);">
    ${item.trackingCode}
    <span style="display: block; font-size: 10px; color: var(--color-carbon-400); font-family: var(--font-sans); font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px;">${item.address}</span>
  </td>
  <td style="font-weight: 500; color: var(--color-carbon-800);">
    ${item.recipient}
  </td>
  <td>
    <span style="font-family: var(--font-mono); font-size: 12px; background-color: var(--color-carbon-100); color: var(--color-carbon-900); border: 1px solid var(--color-carbon-200); padding: 2px 6px; border-radius: 4px;">${item.pin || '----'}</span>
  </td>
  <td>
    ${getStatusBadgeHtml(item.status)}
  </td>
  <td style="text-align: right; white-space: nowrap;">
    <button onclick="trackFromOperator('${item.trackingCode}')" title="Ver en cliente" class="btn-table-action">
      Rastrear
    </button>
    <button onclick="openLabelModal(${item.id})" title="Rótulo" class="btn-table-action">
      Rótulo
    </button>
    <button onclick="prepareEdit(${item.id})" title="Editar" class="btn-table-icon">
      ✎
    </button>
    <button onclick="deleteShipment(${item.id})" title="Eliminar" class="btn-table-icon delete">
      ✕
    </button>
  </td>
`;

        tableBody.appendChild(tr);
    });
}

window.trackFromOperator = function (code) {
    switchRole('client');
    selectShipmentForSimulationByCode(code);
};

window.deleteShipment = function (id) {
    shipments = shipments.filter(s => s.id !== id);
    renderShipmentsTable();
    refreshMapMarkers();
    showToast("Envío eliminado del registro", "info");
};

window.prepareEdit = function (id) {
    const item = shipments.find(s => s.id === id);
    if (!item) return;

    editIdInput.value = item.id;
    trackingCodeInput.value = item.trackingCode;
    recipientInput.value = item.recipient;
    addressInput.value = item.address;
    statusSelect.value = item.status;
    packageTypeSelect.value = item.packageType || "Paquete estándar (2 - 10kg)";
    packagePinInput.value = item.pin || generateRandomPin();

    formTitle.textContent = "Editar Envío";
    formBadge.textContent = "Edición";
    btnSubmitText.textContent = "Actualizar";
    btnCancel.classList.remove("hidden");

    shipmentForm.scrollIntoView({ behavior: "smooth" });
};

function resetForm() {
    shipmentForm.reset();
    editIdInput.value = "";
    packagePinInput.value = generateRandomPin();
    trackingCodeInput.value = generateRandomTracking();
    formTitle.textContent = "Registrar Nuevo Envío";
    formBadge.textContent = "Alta";
    btnSubmitText.textContent = "Guardar Envío";
    btnCancel.classList.add("hidden");
}

/**
 * Consulta un envío individual desde el backend API Flask /api/envios/<code_guia>
 */
window.selectShipmentForSimulationByCode = async function (code) {
    if (!code) return;
    const trackingClean = code.trim().toUpperCase();
    
    // Primero busca en memoria local
    let item = shipments.find(s => s.trackingCode.toUpperCase() === trackingClean);

    // Si no está en memoria local, consulta a la API backend GET /api/envios/<tracking_code>
    if (!item) {
        try {
            const res = await fetch(`/api/envios/${encodeURIComponent(trackingClean)}`);
            if (res.ok) {
                const data = await res.json();
                item = normalizeShipment(data);
            }
        } catch (e) {
            console.error("Error al consultar API por tracking code:", e);
        }
    }

    if (item) {
        selectShipmentForSimulation(item);
        showToast(`Ruta de ${item.trackingCode} activa`, "info");
    } else {
        showToast(`Guía ${trackingClean} no encontrada en la API`, "error");
    }
};

// --------------------------------------------------------------------------
// 11. CONFIGURACIÓN DE ESCUCHADORES DE EVENTOS (EVENT LISTENERS)
// --------------------------------------------------------------------------

btnValidatePin.addEventListener("click", validateDeliveryPin);
pinInputCode.addEventListener("keypress", (e) => {
    if (e.key === "Enter") validateDeliveryPin();
});

btnSimPlay.addEventListener("click", toggleSimulation);

btnSimReset.addEventListener("click", () => {
    stopSimulation();
    if (simulationRoutePoints.length > 0) {
        currentTruckMarker.setLatLng(simulationRoutePoints[0]);
        simProgressBar.style.width = "0%";
        simProgressText.textContent = "0%";
        renderTimeline(0);
        map.panTo(simulationRoutePoints[0]);
    }
});

speedButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        speedButtons.forEach(b => {
            b.classList.remove("bg-fedex-purple", "text-white");
            b.classList.add("text-carbon-600");
        });
        btn.classList.add("bg-fedex-purple", "text-white");
        btn.classList.remove("text-carbon-600");

        simulationSpeed = parseInt(btn.getAttribute("data-speed"));
        if (isSimulating) {
            startSimulation();
        }
    });
});

btnShowLabelClient.addEventListener("click", () => {
    if (activeSimulatedShipment) {
        openLabelModal(activeSimulatedShipment.id);
    }
});

btnCalculateQuote.addEventListener("click", async () => {
    const destText = quoteDestination.value.trim();
    const weightKg = parseFloat(quoteWeight.value);

    if (!destText) {
        showToast("Ingresá un destino para cotizar", "warning");
        return;
    }

    btnCalculateQuote.disabled = true;
    btnCalculateQuote.textContent = "Calculando...";

    try {
        const destCoords = await geocodeAddress(destText);
        const routeData = await fetchRoadRoute(LOGISTIC_HUB, destCoords);
        const distanceKm = parseFloat(routeData.distanceKm);

        const baseCost = 3500;
        const kmCost = distanceKm * 120;
        const weightCost = weightKg * 400;
        const total = Math.round(baseCost + kmCost + weightCost);

        let slaText = "FedEx Priority (24-48 hs)";
        if (distanceKm > 100 && distanceKm <= 500) {
            slaText = "FedEx Express Saver (48 a 72 hs)";
        } else if (distanceKm > 500) {
            slaText = "FedEx Domestic Ground (3 a 5 días)";
        }

        quoteDistance.textContent = `${distanceKm} km`;
        quoteSla.textContent = slaText;
        quoteTotalPrice.textContent = `$${total.toLocaleString("es-AR")}`;
        quoteResultCard.classList.remove("hidden");
        showToast(`Cotización calculada: ${distanceKm} km`, "info");
    } catch (err) {
        showToast("Error al cotizar destino", "error");
    } finally {
        btnCalculateQuote.disabled = false;
        btnCalculateQuote.textContent = "Obtener Tarifa Estimada";
    }
});

tableFilterInput.addEventListener("input", (e) => {
    renderShipmentsTable(e.target.value);
});

btnGenerateCode.addEventListener("click", () => {
    trackingCodeInput.value = generateRandomTracking();
});

btnCancel.addEventListener("click", resetForm);

btnSearch.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        selectShipmentForSimulationByCode(query);
    } else {
        showToast("Ingresá un código de guía", "warning");
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        btnSearch.click();
    }
});

btnResetMap.addEventListener("click", () => {
    if (activeSimulatedShipment && currentRoutePolyline) {
        map.fitBounds(currentRoutePolyline.getBounds(), { padding: [40, 40] });
    } else {
        map.setView([-34.6037, -58.3816], 12);
    }
});

shipmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = editIdInput.value;
    const trackingCode = trackingCodeInput.value.trim().toUpperCase();
    const recipient = recipientInput.value.trim();
    const address = addressInput.value.trim();
    const status = statusSelect.value;
    const packageType = packageTypeSelect.value;
    const pin = packagePinInput.value.trim() || generateRandomPin();

    btnSubmit.disabled = true;
    btnSpinner.classList.remove("hidden");

    if (id) {
        const item = shipments.find(s => s.id === parseInt(id));
        if (item) {
            item.trackingCode = trackingCode;
            item.recipient = recipient;
            item.status = status;
            item.packageType = packageType;
            item.pin = pin;

            if (item.address !== address) {
                item.address = address;
                const coords = await geocodeAddress(address);
                item.lat = coords.lat;
                item.lon = coords.lon;
            }
            showToast(`Envío ${trackingCode} actualizado`, "info");
        }
    } else {
        const coords = await geocodeAddress(address);
        const newShipment = {
            id: Date.now(),
            trackingCode,
            recipient,
            address,
            status,
            packageType,
            pin,
            lat: coords.lat,
            lon: coords.lon
        };
        shipments.unshift(newShipment);
        showToast(`Envío ${trackingCode} dado de alta`, "success");
        selectShipmentForSimulation(newShipment);
    }

    btnSubmit.disabled = false;
    btnSpinner.classList.add("hidden");
    resetForm();
    renderShipmentsTable();
    refreshMapMarkers();
});

// --------------------------------------------------------------------------
// 12. EVENTO DE CARGA INICIAL CONEXIÓN A API REST FLASK
// --------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", async () => {
    packagePinInput.value = generateRandomPin();
    trackingCodeInput.value = generateRandomTracking();

    // Carga de datos reales desde el backend Flask (GET /api/envios)
    await loadShipmentsFromBackend();

    setupMap();
    renderShipmentsTable();
    renderQuickDemoPills();
});
