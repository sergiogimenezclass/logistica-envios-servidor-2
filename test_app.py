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

    # =========================================================================
    # BLOQUE 3 a 8: Endpoints API REST (GET, POST, PUT, DELETE)
    # =========================================================================

    @unittest.skip("Pendiente de implementación en Baby Step 3.1")
    def test_baby_step_3_1_get_all_shipments(self):
        """Baby Step 3.1: Endpoint GET /api/envios retorna lista JSON"""
        pass

    @unittest.skip("Pendiente de implementación en Baby Step 5.1")
    def test_baby_step_5_1_get_single_shipment(self):
        """Baby Step 5.1: Endpoint GET /api/envios/<tracking_code> (200 OK / 404 Not Found)"""
        pass

    @unittest.skip("Pendiente de implementación en Baby Step 6.1")
    def test_baby_step_6_1_create_shipment(self):
        """Baby Step 6.1: Endpoint POST /api/envios crea un nuevo envío (201 Created)"""
        pass

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
