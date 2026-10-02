import unittest
import sqlite3
from app import app

class TestAppSuite(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    # =========================================================================
    # BLOQUE 1: Servidor Flask Base y Archivos Estáticos
    # =========================================================================

    def test_baby_step_1_1_app_exists(self):
        """Baby Step 1.1: Instancia básica de Flask configurada correctamente"""
        self.assertIsNotNone(app)

    def test_baby_step_1_2_root_route(self):
        """Baby Step 1.2: Ruta raíz '/' sirve index.html mediante render_template con HTTP 200 OK"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('<!DOCTYPE html>', response.get_data(as_text=True))

    def test_baby_step_1_3_static_files(self):
        """Baby Step 1.3: Servicio de archivos estáticos (/static/css/styles.css y /static/js/app.js)"""
        res_css = self.client.get('/static/css/styles.css')
        self.assertEqual(res_css.status_code, 200)

        res_js = self.client.get('/static/js/app.js')
        self.assertEqual(res_js.status_code, 200)

    # =========================================================================
    # BLOQUE 2: Base de Datos SQLite e Inicialización
    # =========================================================================

    def test_baby_step_2_1_db_connection(self):
        """Baby Step 2.1: Función conector a SQLite database.db"""
        from app import get_db_connection
        conn = get_db_connection()
        self.assertIsNotNone(conn)
        self.assertIsInstance(conn, sqlite3.Connection)
        conn.close()

    def test_baby_step_2_2_table_schema(self):
        """Baby Step 2.2: Verificación de la tabla 'envios' y sus columnas"""
        from app import init_db, get_db_connection
        init_db()
        conn = get_db_connection()
        columns_info = conn.execute("PRAGMA table_info(envios)").fetchall()
        column_names = [col['name'] for col in columns_info]
        conn.close()

        expected_columns = [
            'id', 'tracking_code', 'recipient', 'address', 
            'status', 'package_type', 'pin', 'lat', 'lon', 'created_at'
        ]
        for col in expected_columns:
            self.assertIn(col, column_names)

    def test_baby_step_2_3_seed_data(self):
        """Baby Step 2.3: Verificación de datos semilla iniciales"""
        from app import init_db, get_db_connection
        init_db()
        conn = get_db_connection()
        count = conn.execute("SELECT COUNT(*) FROM envios").fetchone()[0]
        conn.close()
        self.assertGreaterEqual(count, 3)

    def test_baby_step_2_4_auto_init(self):
        """Baby Step 2.4: Auto-inicialización de la BD al cargar la app"""
        import os
        from app import get_db_connection
        self.assertTrue(os.path.exists('database.db'))
        conn = get_db_connection()
        count = conn.execute("SELECT COUNT(*) FROM envios").fetchone()[0]
        conn.close()
        self.assertGreaterEqual(count, 3)

    # =========================================================================
    # BLOQUE 3 a 8: Endpoints API REST (GET, POST, PUT, DELETE)
    # =========================================================================

    def test_baby_step_3_1_get_all_shipments(self):
        """Baby Step 3.1: Endpoint GET /api/envios retorna lista JSON"""
        response = self.client.get('/api/envios')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 3)
        for item in data:
            self.assertIn('tracking_code', item)
            self.assertIn('recipient', item)
            self.assertIn('status', item)


    def test_baby_step_5_1_get_single_shipment(self):
        """Baby Step 5.1: Endpoint GET /api/envios/<tracking_code> (200 OK / 404 Not Found)"""
        # Prueba con guía existente
        response = self.client.get('/api/envios/AR-1001')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['tracking_code'], 'AR-1001')
        self.assertEqual(data['recipient'], 'Lucía Fernández')

        # Prueba con guía inexistente
        response_404 = self.client.get('/api/envios/AR-9999')
        self.assertEqual(response_404.status_code, 404)
        data_404 = response_404.get_json()
        self.assertIn('error', data_404)


    def test_baby_step_6_1_create_shipment(self):
        """Endpoint POST /api/envios crea un nuevo envío (201 Created)"""
        import time
        unique_code = f"AR-POST-{int(time.time() * 1000) % 10000}"
        new_payload = {
            'tracking_code': unique_code,
            'recipient': 'Gonzalo Pérez',
            'address': 'Av. Santa Fe 2000, CABA',
            'status': 'En preparación',
            'package_type': 'FedEx Box Estándar',
            'pin': '5555',
            'lat': -34.59,
            'lon': -58.39
        }
        response = self.client.post('/api/envios', json=new_payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('id', data)
        self.assertEqual(data['tracking_code'], unique_code)
        self.assertEqual(data['recipient'], 'Gonzalo Pérez')

        # Prueba con campos faltantes (400 Bad Request)
        bad_response = self.client.post('/api/envios', json={'recipient': 'Incompleto'})
        self.assertEqual(bad_response.status_code, 400)



    @unittest.skip("Pendiente de implementación en Baby Step 7.1")
    def test_baby_step_7_1_update_shipment(self):
        """Baby Step 7.1: Endpoint PUT /api/envios/<id> actualiza estado/PIN (200 OK)"""
        pass

    @unittest.skip("Pendiente de implementación en Baby Step 8.1")
    def test_baby_step_8_1_delete_shipment(self):
        """Baby Step 8.1: Endpoint DELETE /api/envios/<id> elimina un registro (200/204)"""
        pass

if __name__ == '__main__':
    unittest.main()
