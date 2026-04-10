# Modelo - Clase Material

class Material:
    def __init__(self, id, nombre, unidad, cantidad):
        """
        Representa un material.
        """
        self.__id = id
        self.__nombre = nombre
        self.__unidad = unidad
        self.__cantidad = cantidad

    #  PROPERTIES 
    @property
    def id(self):
        return self.__id

    @property
    def nombre(self):
        return self.__nombre

    @nombre.setter
    def nombre(self, value):
        self.__nombre = value

    @property
    def unidad(self):
        return self.__unidad

    @unidad.setter
    def unidad(self, value):
        self.__unidad = value

    @property
    def cantidad(self):
        return self.__cantidad

    @cantidad.setter
    def cantidad(self, value):
        self.__cantidad = value
