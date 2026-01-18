package controller

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"sanJoseProyect/database"
	"sanJoseProyect/models"
)

// CreateInMovement - Registra entrada de mercadería
func CreateInMovement(c *fiber.Ctx) error {
	req := new(models.CreateInMovementRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Solicitud inválida",
		})
	}

	// Validar campos requeridos
	if req.NumeroFactura == "" || req.Fecha == "" || req.Codigo == "" || req.Descripcion == "" || req.Cantidad <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Todos los campos son requeridos",
		})
	}

	// Parsear fecha
	fecha, err := time.Parse("2006-01-02", req.Fecha)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Formato de fecha inválido (use YYYY-MM-DD)",
		})
	}

	// Buscar el producto por código
	var producto models.Product
	if err := database.DB.Where("codigo = ?", req.Codigo).First(&producto).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Producto no encontrado",
		})
	}

	// Crear movimiento
	movimiento := models.Movement{
		ProductoID:    producto.ID,
		NumeroFactura: req.NumeroFactura,
		Fecha:         fecha,
		Codigo:        req.Codigo,
		Descripcion:   req.Descripcion,
		Cantidad:      req.Cantidad,
		Tipo:          "ENTRADA",
	}

	if err := database.DB.Create(&movimiento).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al crear el movimiento",
		})
	}

	// Actualizar stock del producto (sumar cantidad)
	if err := database.DB.Model(&producto).Update("stock", producto.Stock+uint(req.Cantidad)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al actualizar el stock",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"mensaje":    "Entrada de mercadería registrada correctamente",
		"movimiento": movimiento,
	})
}

// CreateOutMovement - Registra salida de mercadería
func CreateOutMovement(c *fiber.Ctx) error {
	req := new(models.CreateOutMovementRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Solicitud inválida",
		})
	}

	// Validar campos requeridos
	if req.Fecha == "" || req.Codigo == "" || req.Descripcion == "" || req.Cantidad <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Todos los campos son requeridos",
		})
	}

	// Parsear fecha
	fecha, err := time.Parse("2006-01-02", req.Fecha)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Formato de fecha inválido (use YYYY-MM-DD)",
		})
	}

	// Buscar el producto por código
	var producto models.Product
	if err := database.DB.Where("codigo = ?", req.Codigo).First(&producto).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Producto no encontrado",
		})
	}

	// Validar que hay stock disponible
	if producto.Stock < uint(req.Cantidad) {
		return c.Status(fiber.StatusBadRequest).JSON(models.ErrorResponse{
			Error: "Stock insuficiente para esta salida",
		})
	}

	// Crear movimiento (cantidad negativa)
	movimiento := models.Movement{
		ProductoID:    producto.ID,
		NumeroFactura: "", // Vacío para salidas
		Fecha:         fecha,
		Codigo:        req.Codigo,
		Descripcion:   req.Descripcion,
		Cantidad:      -req.Cantidad, // Negativo para indicar salida
		Tipo:          "SALIDA",
	}

	if err := database.DB.Create(&movimiento).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al crear el movimiento",
		})
	}

	// Actualizar stock del producto (restar cantidad)
	if err := database.DB.Model(&producto).Update("stock", producto.Stock-uint(req.Cantidad)).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al actualizar el stock",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"mensaje":    "Salida de mercadería registrada correctamente",
		"movimiento": movimiento,
	})
}

// GetMovements - Obtiene todos los movimientos (con filtro opcional)
func GetMovements(c *fiber.Ctx) error {
	tipo := c.Query("tipo")     // "ENTRADA", "SALIDA" o vacío para todos
	codigo := c.Query("codigo") // Código del producto
	fechaInicio := c.Query("fecha_inicio")
	fechaFin := c.Query("fecha_fin")

	var movimientos []models.Movement
	query := database.DB.Preload("Producto")

	if tipo != "" {
		query = query.Where("tipo = ?", tipo)
	}

	if codigo != "" {
		query = query.Where("codigo = ?", codigo)
	}

	if fechaInicio != "" && fechaFin != "" {
		inicio, _ := time.Parse("2006-01-02", fechaInicio)
		fin, _ := time.Parse("2006-01-02", fechaFin)
		query = query.Where("fecha BETWEEN ? AND ?", inicio, fin)
	}

	if err := query.Order("fecha DESC").Find(&movimientos).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.ErrorResponse{
			Error: "Error al obtener movimientos",
		})
	}

	return c.Status(fiber.StatusOK).JSON(movimientos)
}

// GetMovementByID - Obtiene un movimiento por ID
func GetMovementByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var movimiento models.Movement
	if err := database.DB.Preload("Producto").First(&movimiento, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.ErrorResponse{
			Error: "Movimiento no encontrado",
		})
	}

	return c.Status(fiber.StatusOK).JSON(movimiento)
}
