package controller

import (
	"github.com/gofiber/fiber/v2"
	"sanJoseProyect/database"
	"sanJoseProyect/models"
)

// ============================================
// PRODUCTOS
// ============================================

func CreateProduct(c *fiber.Ctx) error {
	req := new(models.CreateProductRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Solicitud inválida",
		})
	}
	if req.Descripcion == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "La descripción es obligatoria",
		})
	}
	// Verificar que el código no exista
	var existente models.Product
	if err := database.DB.Where("codigo = ?", req.Codigo).First(&existente).Error; err == nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "El código de producto ya existe",
		})
	}
	producto := models.Product{
		Codigo:       req.Codigo,
		Descripcion:  req.Descripcion,
		Stock:        req.Stock,
		TipoCantidad: req.TipoCantidad, // ✅ AGREGADO
	}
	if err := database.DB.Create(&producto).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al crear el producto",
		})
	}
	return c.Status(fiber.StatusCreated).JSON(producto)
}

func GetProducts(c *fiber.Ctx) error {
	var productos []models.Product
	if err := database.DB.Find(&productos).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al obtener productos",
		})
	}
	return c.JSON(productos)
}

func GetProductByID(c *fiber.Ctx) error {
	id := c.Params("id")
	var producto models.Product
	if err := database.DB.First(&producto, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Producto no encontrado",
		})
	}
	return c.JSON(producto)
}

func GetProductByCodigo(c *fiber.Ctx) error {
	codigo := c.Params("codigo")
	var producto models.Product
	if err := database.DB.Where("codigo = ?", codigo).First(&producto).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Producto no encontrado",
		})
	}
	return c.JSON(producto)
}

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

	// Si se envía un nuevo código, verificar que no exista
	if req.Codigo != nil && *req.Codigo != producto.Codigo {
		var existente models.Product
		if err := database.DB.Where("codigo = ? AND id != ?", *req.Codigo, producto.ID).First(&existente).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
				Error: "El código de producto ya existe",
			})
		}
		producto.Codigo = *req.Codigo
	}

	if req.Descripcion != "" {
		producto.Descripcion = req.Descripcion
	}

	if req.Stock > 0 {
		producto.Stock = req.Stock
	}

	if err := database.DB.Save(&producto).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al actualizar producto",
		})
	}

	return c.JSON(producto)
}

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
			Error: "Error al eliminar producto",
		})
	}

	return c.JSON(fiber.Map{
		"mensaje": "Producto eliminado correctamente",
	})
}
