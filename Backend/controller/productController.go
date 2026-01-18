package controller

import (
	"github.com/gofiber/fiber/v2"
	"sanJoseProyect/database"
	"sanJoseProyect/models"
)

// CreateProduct - Crea un nuevo producto
func CreateProduct(c *fiber.Ctx) error {
	req := new(models.CreateProductRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Solicitud inválida",
		})
	}

	// Validar campos requeridos
	if req.Codigo == "" || req.Descripcion == "" || req.Precio <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Todos los campos son requeridos",
		})
	}

	// Crear producto
	producto := models.Product{
		Codigo:      req.Codigo,
		Descripcion: req.Descripcion,
		Stock:       req.Stock,
		Precio:      req.Precio,
	}

	if err := database.DB.Create(&producto).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al crear el producto",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"mensaje":  "Producto creado correctamente",
		"producto": producto,
	})
}

// GetProducts - Obtiene todos los productos
func GetProducts(c *fiber.Ctx) error {
	var productos []models.Product

	if err := database.DB.Find(&productos).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al obtener productos",
		})
	}

	return c.Status(fiber.StatusOK).JSON(productos)
}

// GetProductByID - Obtiene un producto por ID
func GetProductByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var producto models.Product
	if err := database.DB.First(&producto, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Producto no encontrado",
		})
	}

	return c.Status(fiber.StatusOK).JSON(producto)
}

// GetProductByCode - Obtiene un producto por código
func GetProductByCode(c *fiber.Ctx) error {
	codigo := c.Params("codigo")

	var producto models.Product
	if err := database.DB.Where("codigo = ?", codigo).First(&producto).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Producto no encontrado",
		})
	}

	return c.Status(fiber.StatusOK).JSON(producto)
}

// UpdateProduct - Actualiza un producto
func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	req := new(models.UpdateProductRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Solicitud inválida",
		})
	}

	var producto models.Product
	if err := database.DB.First(&producto, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Producto no encontrado",
		})
	}

	// Actualizar solo los campos proporcionados
	if req.Codigo != "" {
		producto.Codigo = req.Codigo
	}
	if req.Descripcion != "" {
		producto.Descripcion = req.Descripcion
	}
	if req.Stock > 0 {
		producto.Stock = req.Stock
	}
	if req.Precio > 0 {
		producto.Precio = req.Precio
	}

	if err := database.DB.Save(&producto).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al actualizar el producto",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"mensaje":  "Producto actualizado correctamente",
		"producto": producto,
	})
}

// DeleteProduct - Elimina un producto
func DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	var producto models.Product
	if err := database.DB.First(&producto, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Producto no encontrado",
		})
	}

	if err := database.DB.Delete(&producto).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al eliminar el producto",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"mensaje": "Producto eliminado correctamente",
	})
}
