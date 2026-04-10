# Vista (Interfaz gráfica de usuario)


import tkinter as tk
from tkinter import ttk
from tkinter import messagebox
from models.Material import Material
from material_manager import MaterialManager

class Application(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Gestión de Materiales - Recicladora")
        self.geometry("1000x600")
        self.configure(bg="#e8f0fe")

        
        self.style = ttk.Style(self)
        self.style.theme_use("clam")

        # controlador de base de datos
        self.material_manager = MaterialManager()

        # Ccnstrucción de interfaz
        self.crear_menu()
        self.crear_tabla()
        self.actualizar_tabla()

    # ----------------------------------------------------------------------
    def crear_menu(self):
        """
        Crea la barra de menú principal de la aplicación.
        """
        self.menu_bar = tk.Menu(self, tearoff=0, bg="#ffffff", fg="#000000",
                                activebackground="white", font=("Segoe UI", 10))

        # Menú de Materiales
        materiales_menu = tk.Menu(self.menu_bar, tearoff=0, bg="#f9f9f9", fg="#000",
                                   activebackground="#4caf50", activeforeground="white", font=("Segoe UI", 10))
        materiales_menu.add_command(label="Alta de Material", command=self.alta_material)
        materiales_menu.add_command(label="Comprar Material", command=self.comprar_material)
        materiales_menu.add_command(label="Vender Material", command=self.vender_material)


        self.menu_bar.add_cascade(label="Materiales", menu=materiales_menu)
        self.config(menu=self.menu_bar)

    # ----------------------------------------------------------------------
    def crear_tabla(self):
        """
        Crea la tabla visual donde se muestran los proveedores.
        """
        self.table_frame = tk.Frame(self, bg="#e8f0fe")
        self.table_frame.pack(padx=20, pady=20)

        style = ttk.Style()
        style.configure("Treeview.Heading", font=("Segoe UI", 10, "bold"))
        style.configure("Treeview", font=("Segoe UI", 10), rowheight=25,
                        background="#ffffff", foreground="#000000", fieldbackground="#ffffff")
        style.map("Treeview", background=[("selected", "#ffa726")], foreground=[("selected", "#000000")])

        # Configuración de columnas
        self.table = ttk.Treeview(
            self.table_frame,
            columns=("id", "nombre", "unidad", "cantidad"),
            show="headings",
            selectmode="browse"
        )

        self.table.heading("id", text="ID")
        self.table.heading("nombre", text="Material")
        self.table.heading("unidad", text="Unidad de Medida")
        self.table.heading("cantidad", text="Cantidad")

        self.table.column("id", width=50, anchor="center")
        self.table.column("nombre", width=150)
        self.table.column("unidad", width=200)
        self.table.column("cantidad", width=120, anchor="center")

        self.table.pack(fill="both", expand=True)

    # ----------------------------------------------------------------------
    def actualizar_tabla(self):
        """
        Actualiza los datos mostrados en la tabla.
        """
        self.table.delete(*self.table.get_children())
        materiales = self.material_manager.obtener_todos_los_materiales()

        if materiales:
            for m in materiales:
                self.table.insert("", "end", values=(m.id, m.nombre, m.unidad, m.cantidad))
        else:
            self.table.insert("", "end", values=("No hay materiales cargados.", "", "", ""))

    # ----------------------------------------------------------------------
    def alta_material(self):
        """
        Ventana emergente para agregar un nuevo material.
        """
        win = tk.Toplevel(self)
        win.title("Alta de material")
        win.geometry("400x400")
        win.configure(bg="#f0f0f0")

        frame = tk.Frame(win, bg="#f0f0f0")
        frame.pack(padx=20, pady=20, expand=True, fill="both")

        campos = {
            "Nombre": tk.Entry(frame, font=("Segoe UI", 11), width=30),
            "Unidad": ttk.Combobox(frame, values=["kg", "m3", "unidad"], state="readonly")
        }

        campos["Unidad"].set("kg"),      #valor por defecto

        for label, entry in campos.items():
            tk.Label(frame, text=label + ":", font=("Segoe UI", 11), bg="#f0f0f0").pack(pady=5)
            entry.pack()

        def guardar():
            material = Material(
                None,
                campos["Nombre"].get(),
                campos["Unidad"].get(),
                0                       #siempre inicia en 0
            )
            resultado = self.material_manager.insertar_material(material)

            if resultado:
                win.destroy()
                self.actualizar_tabla()
            else:
                messagebox.showerror("Error", "El material ya existe")

        tk.Button(frame, text="Guardar", font=("Segoe UI", 10), bg="#4caf50", fg="white",
                  activebackground="#45a049", command=guardar).pack(pady=15)

    # ----------------------------------------------------------------------
    def comprar_material(self):
        """
        ventana para comprar un material.
        """
        win = tk.Toplevel(self)
        win.title("Comprar Material")
        win.geometry("300x220")
        win.configure(bg="#f0f0f0")

        frame = tk.Frame(win, bg="#f0f0f0")
        frame.pack(padx=20, pady=20, expand=True, fill="both")

        tk.Label(frame, text="ID del Material:", font=("Segoe UI", 11), bg="#f0f0f0").pack(pady=5)
        id_entry = tk.Entry(frame, font=("Segoe UI", 11), width=20)
        id_entry.pack()

        tk.Label(frame, text="Cantidad:", bg="#f0f0f0").pack()
        cantidad_entry = tk.Entry(frame)
        cantidad_entry.pack()

        def comprar():
            try:
                id = int(id_entry.get())
                cantidad = float(cantidad_entry.get())

                self.material_manager.comprar_material(id, cantidad)
                win.destroy()
                self.actualizar_tabla()
            except ValueError:
                print("Ingrese un número válido.")

        tk.Button(frame, text="Comprar", font=("Segoe UI", 10), bg="#4caf50", fg="white",
                 command=comprar).pack(pady=10)

    # ----------------------------------------------------------------------

    def vender_material(self):
        """
        ventana para vender un material.
        """
        win = tk.Toplevel(self)
        win.title("Vender Material")
        win.geometry("300x220")
        win.configure(bg="#f0f0f0")

        frame = tk.Frame(win, bg="#f0f0f0")
        frame.pack(padx=20, pady=20, expand=True, fill="both")

        tk.Label(frame, text="ID del Material:", font=("Segoe UI", 11), bg="#f0f0f0").pack(pady=5)
        id_entry = tk.Entry(frame, font=("Segoe UI", 11), width=20)
        id_entry.pack()

        tk.Label(frame, text="Cantidad:", bg="#f0f0f0").pack()
        cantidad_entry = tk.Entry(frame)
        cantidad_entry.pack()

        def vender():
            try:
                id = int(id_entry.get())
                cantidad = float(cantidad_entry.get())

                self.material_manager.vender_material(id, cantidad)
                win.destroy()
                self.actualizar_tabla()
            except ValueError:
                print("Ingrese un número válido.")

        tk.Button(frame, text="Vender", font=("Segoe UI", 10), bg="#df3e3b", fg="white",
                   command=vender).pack(pady=10)


   
    # ----------------------------------------------------------------------
    def quit(self):
        """
        Cierra la aplicación y la conexión con la base de datos.
        """
        self.material_manager.cerrar_conexion()
        self.destroy()


# Si este archivo es el principal, se ejecuta la app
if __name__ == "__main__":
    app = Application()
    app.mainloop()
