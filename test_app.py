import unittest
from app import app

class TestAppBase(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_baby_step_1_1_app_exists(self):
        """Baby Step 1.1: Verificar que la instancia de la aplicación Flask existe"""
        self.assertIsNotNone(app)

    def test_baby_step_1_2_root_route(self):
        """Baby Step 1.2: Verificar que la ruta raíz '/' entrega index.html con HTTP 200 OK"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('<!DOCTYPE html>', response.get_data(as_text=True))

if __name__ == '__main__':
    unittest.main()
