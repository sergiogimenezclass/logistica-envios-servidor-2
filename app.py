import sqlite3
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS envios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tracking_code TEXT UNIQUE NOT NULL,
            recipient TEXT NOT NULL,
            address TEXT NOT NULL,
            status TEXT NOT NULL,
            package_type TEXT NOT NULL,
            pin TEXT NOT NULL,
            lat REAL,
            lon REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('SELECT COUNT(*) FROM envios')
    count = cursor.fetchone()[0]
    
    if count == 0:
        seed_shipments = [
            ('AR-1001', 'Lucía Fernández', 'Av. Corrientes 1350, San Nicolás, CABA', 'En camino', 'FedEx Express Standard', '4921', -34.6044, -58.3871),
            ('AR-2045', 'Martín Benítez', 'Av. Colón 1200, Córdoba Capital', 'En preparación', 'FedEx Box Estándar (2 a 5 kg)', '8104', -31.4135, -64.1952),
            ('AR-3390', 'Camila Rossi', 'Bv. Oroño 850, Rosario, Santa Fe', 'Entregado', 'FedEx Envelope (< 1kg)', '1932', -32.9468, -60.6558)
        ]
        cursor.executemany('''
            INSERT INTO envios (tracking_code, recipient, address, status, package_type, pin, lat, lon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', seed_shipments)
    
    conn.commit()
    conn.close()

# Auto-inicialización de la base de datos al importar el módulo
with app.app_context():
    init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/envios', methods=['GET'])
def get_envios():
    conn = get_db_connection()
    envios = conn.execute('SELECT * FROM envios').fetchall()
    conn.close()
    return jsonify([dict(row) for row in envios]), 200

@app.route('/api/envios/<tracking_code>', methods=['GET'])
def get_envio_by_tracking(tracking_code):
    conn = get_db_connection()
    envio = conn.execute('SELECT * FROM envios WHERE tracking_code = ?', (tracking_code,)).fetchone()
    conn.close()
    
    if envio is None:
        return jsonify({'error': 'Envío no encontrado'}), 404
        
    return jsonify(dict(envio)), 200

@app.route('/api/envios', methods=['POST'])
def create_envio():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Payload JSON requerido'}), 400

    tracking_code = data.get('tracking_code') or data.get('trackingCode')
    recipient = data.get('recipient')
    address = data.get('address')
    status = data.get('status', 'En preparación')
    package_type = data.get('package_type') or data.get('packageType', 'FedEx Express Standard')
    pin = data.get('pin', '0000')
    lat = data.get('lat')
    lon = data.get('lon')

    if not tracking_code or not recipient or not address:
        return jsonify({'error': 'Faltan campos obligatorios (tracking_code, recipient, address)'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO envios (tracking_code, recipient, address, status, package_type, pin, lat, lon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (tracking_code, recipient, address, status, package_type, pin, lat, lon))
        conn.commit()
        new_id = cursor.lastrowid
        new_envio = conn.execute('SELECT * FROM envios WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return jsonify(dict(new_envio)), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'El código de seguimiento ya existe'}), 400



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

