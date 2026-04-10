# Controlador / Manejador de base de datos (Data Mapper)
# Se encarga de todas las operaciones CRUD de los materiales.

import sqlite3
from models.Material import Material


class MaterialManager:
    def __init__(self):
        """
        Constructor que inicializa la conexion con la base de datos
        y crea la tabla de proveedores si no existe.
        """
        self._connection = sqlite3.connect("recicladora.db")
        self._cursor = self._connection.cursor()
        self._crear_tabla()
        self.inicializar_materiales() 

    # ------------------------------------------------------------------------
    def _crear_tabla(self):
        """
        Crea la tabla de materiales si no existe.
        """
        self._cursor.execute("""
            CREATE TABLE IF NOT EXISTS materiales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT UNIQUE,
                unidad TEXT,
                cantidad REAL
            );
        """)
        self._connection.commit()

    # ------------------------------------------------------------------------

    def inicializar_materiales(self):
        self._cursor.execute("SELECT COUNT(*) FROM materiales")
        cantidad = self._cursor.fetchone()[0]

        if cantidad == 0:
            materiales_iniciales = [
                ("Vidrio", "kg"),
                ("Hierro", "kg"),
                ("Aluminio", "kg"),
                ("Cobre", "kg"),
                ("Bronce", "kg"),
                ("Cartón", "kg"),
                ("Papel Blanco", "kg"),
                ("Tapas de plástico", "kg"),
                ("Aceite de girasol", "m3"),
                ("Baterías de vehículos", "unidad")
            ]

            for nombre, unidad in materiales_iniciales:
                self._cursor.execute(
                    "INSERT INTO materiales (nombre, unidad, cantidad) VALUES (?, ?, ?)",
                    (nombre, unidad, 0)
                )

            self._connection.commit()
            print("Materiales iniciales cargados.")

    # ------------------------------------------------------------------------
    def insertar_material(self, material):
        """
        Inserta un nuevo material en la base de datos.
        """
        try:
            self._cursor.execute("""
                INSERT INTO materiales (nombre, unidad, cantidad)
                VALUES (?, ?, ?)
            """, (material.nombre, material.unidad, material.cantidad ))

            self._connection.commit()
            print("Material agregado correctamente.")
            return True

        except sqlite3.IntegrityError:
            print("El material ya existe.")
            return False

    # ------------------------------------------------------------------------
    def obtener_material(self, id):
        """
        Busca y devuelve un material por su ID.
        """
        self._cursor.execute("SELECT * FROM materiales WHERE id=?", (id,))
        datos = self._cursor.fetchone()

        if datos:
            id, nombre, unidad, cantidad = datos
            return Material(id, nombre, unidad, cantidad)
        else:
            print("Material no encontrado.")
            return None

    # ------------------------------------------------------------------------
    def obtener_todos_los_materiales(self):
        """
        Devuelve una lista de todos los materiales almacenados.
        """
        self._cursor.execute("SELECT * FROM materiales")
        registros = self._cursor.fetchall()

        materiales = []
        for datos in registros:
            id, nombre, unidad, cantidad = datos
            material = Material(id, nombre, unidad, cantidad)
            materiales.append(material)

        return materiales

    # ------------------------------------------------------------------------
    def comprar_material(self, id, cantidad):
        if cantidad <= 0:
            print("La cantidad debe ser positiva")
            return
        
        material = self.obtener_material(id)

        if material:
            nueva_cantidad = material.cantidad + cantidad

            self._cursor.execute(
                "UPDATE materiales SET cantidad=? WHERE id=?",
                (nueva_cantidad, id)
            )
            self._connection.commit()
            print("Compra realizada con éxito.")
        else: 
            print("Material no encontrado.")


    # ------------------------------------------------------------------------
    def vender_material(self, id, cantidad):
        if cantidad <= 0:
            print("La cantidad debe ser positiva")
            return
        
        material = self.obtener_material(id)

        if material:
            if cantidad > material.cantidad:
                print("No hay suficiente stock.")
                return

            nueva_cantidad = material.cantidad - cantidad

            self._cursor.execute(
                "UPDATE materiales SET cantidad=? WHERE id=?",
                (nueva_cantidad, id)
            )
            self._connection.commit()
            print("Venta realizada con éxito.")
        else: 
            print("Material no encontrado.")

    # ------------------------------------------------------------------------
    def cerrar_conexion(self):
        """
        Cierra la conexión con la base de datos.
        """
        self._cursor.close()
        self._connection.close()
