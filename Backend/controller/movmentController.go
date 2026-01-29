package controller

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"sanJoseProyect/database"
	"sanJoseProyect/models"
)

// Función auxiliar para parsear fecha sin zona horaria
func parseLocalDate(dateStr string) (time.Time, error) {
	// Parse la fecha y usa la zona horaria local del servidor
	t, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return time.Time{}, err
	}
	// Crear un nuevo time con solo año, mes, día en zona horaria local
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.Local), nil
}

func CreateInMovement(c *fiber.Ctx) error {
	req := new(models.CreateInMovementRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(models.ErrorResponse{Error: "Solicitud inválida"})
	}

	fecha, err := parseLocalDate(req.Fecha)
	if err != nil {
		return c.Status(400).JSON(models.ErrorResponse{Error: "Formato de fecha inválido"})
	}

	return database.DB.Transaction(func(tx *gorm.DB) error {
		var producto models.Product
		if err := tx.First(&producto, req.ProductoID).Error; err != nil {
			return c.Status(404).JSON(models.ErrorResponse{Error: "Producto no encontrado"})
		}

		mov := models.Movement{
			ProductoID:    producto.ID,
			NumeroFactura: req.NumeroFactura,
			Fecha:         models.CustomDate{Time: fecha}, // ✨ Usar CustomDate
			Descripcion:   req.Descripcion,
			Cantidad:      req.Cantidad, // positiva
			Tipo:          "ENTRADA",
			Estado:        true,
		}

		producto.Stock += uint(req.Cantidad)

		if err := tx.Save(&producto).Error; err != nil {
			return c.Status(500).JSON(models.ErrorResponse{Error: "Error actualizando stock"})
		}
		if err := tx.Create(&mov).Error; err != nil {
			return c.Status(500).JSON(models.ErrorResponse{Error: "Error creando movimiento"})
		}

		return c.Status(201).JSON(mov)
	})
}

func CreateOutMovement(c *fiber.Ctx) error {
	req := new(models.CreateOutMovementRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(models.ErrorResponse{Error: "Solicitud inválida"})
	}

	fecha, err := parseLocalDate(req.Fecha)
	if err != nil {
		return c.Status(400).JSON(models.ErrorResponse{Error: "Formato de fecha inválido"})
	}

	return database.DB.Transaction(func(tx *gorm.DB) error {
		var producto models.Product
		if err := tx.First(&producto, req.ProductoID).Error; err != nil {
			return c.Status(404).JSON(models.ErrorResponse{Error: "Producto no encontrado"})
		}

		if producto.Stock < uint(req.Cantidad) {
			return c.Status(400).JSON(models.ErrorResponse{Error: "Stock insuficiente"})
		}

		mov := models.Movement{
			ProductoID:  producto.ID,
			Fecha:       models.CustomDate{Time: fecha}, // ✨ Usar CustomDate
			Descripcion: req.Descripcion,
			Cantidad:    -req.Cantidad, // NEGATIVA
			Tipo:        "SALIDA",
			Estado:      true,
		}

		producto.Stock -= uint(req.Cantidad)

		if err := tx.Save(&producto).Error; err != nil {
			return c.Status(500).JSON(models.ErrorResponse{Error: "Error actualizando stock"})
		}
		if err := tx.Create(&mov).Error; err != nil {
			return c.Status(500).JSON(models.ErrorResponse{Error: "Error creando movimiento"})
		}

		return c.JSON(mov)
	})
}

// ✨ ACTUALIZADO: Solo se puede anular si Estado es TRUE
func CancelMovement(c *fiber.Ctx) error {
	id := c.Params("id")

	return database.DB.Transaction(func(tx *gorm.DB) error {
		var mov models.Movement
		if err := tx.First(&mov, id).Error; err != nil {
			return c.Status(404).JSON(models.ErrorResponse{Error: "Movimiento no encontrado"})
		}

		// ✨ SOLO SE PUEDE ANULAR SI ESTÁ ACTIVO (Estado = true)
		if !mov.Estado {
			return c.Status(400).JSON(models.ErrorResponse{Error: "El movimiento ya está anulado"})
		}

		var producto models.Product
		if err := tx.First(&producto, mov.ProductoID).Error; err != nil {
			return c.Status(404).JSON(models.ErrorResponse{Error: "Producto no encontrado"})
		}

		cant := abs(mov.Cantidad)

		// ANULAR - devolver el stock
		if mov.Tipo == "ENTRADA" {
			if producto.Stock < uint(cant) {
				return c.Status(400).JSON(models.ErrorResponse{Error: "Stock insuficiente para anular"})
			}
			producto.Stock -= uint(cant)
		} else {
			producto.Stock += uint(cant)
		}

		// Marcar como anulado
		mov.Estado = false

		tx.Save(&producto)
		tx.Save(&mov)

		return c.JSON(mov)
	})
}

func UpdateMovementQuantity(c *fiber.Ctx) error {
	id := c.Params("id")
	req := new(models.UpdateMovementRequest)

	if err := c.BodyParser(req); err != nil || req.Cantidad <= 0 {
		return c.Status(400).JSON(models.ErrorResponse{Error: "Cantidad inválida"})
	}

	return database.DB.Transaction(func(tx *gorm.DB) error {
		var mov models.Movement
		if err := tx.First(&mov, id).Error; err != nil {
			return c.Status(404).JSON(models.ErrorResponse{Error: "Movimiento no encontrado"})
		}
		if !mov.Estado {
			return c.Status(400).JSON(models.ErrorResponse{Error: "No se puede modificar un movimiento anulado"})
		}

		var producto models.Product
		tx.First(&producto, mov.ProductoID)

		oldAbs := abs(mov.Cantidad)
		newAbs := req.Cantidad

		if mov.Tipo == "ENTRADA" {
			diff := newAbs - oldAbs
			if diff < 0 && producto.Stock < uint(-diff) {
				return c.Status(400).JSON(models.ErrorResponse{Error: "Stock insuficiente"})
			}
			producto.Stock += uint(diff)
			mov.Cantidad = newAbs
		} else {
			diff := newAbs - oldAbs
			if diff > 0 && producto.Stock < uint(diff) {
				return c.Status(400).JSON(models.ErrorResponse{Error: "Stock insuficiente"})
			}
			producto.Stock -= uint(diff)
			mov.Cantidad = -newAbs
		}

		tx.Save(&producto)
		tx.Save(&mov)

		return c.JSON(mov)
	})
}

// ✨ NUEVO: Cambiar el producto dentro de un movimiento
func UpdateMovementProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	req := new(models.UpdateMovementProductRequest)

	if err := c.BodyParser(req); err != nil {
		return c.Status(400).JSON(models.ErrorResponse{Error: "Solicitud inválida"})
	}

	return database.DB.Transaction(func(tx *gorm.DB) error {
		var mov models.Movement
		if err := tx.First(&mov, id).Error; err != nil {
			return c.Status(404).JSON(models.ErrorResponse{Error: "Movimiento no encontrado"})
		}

		if !mov.Estado {
			return c.Status(400).JSON(models.ErrorResponse{Error: "No se puede modificar un movimiento anulado"})
		}

		// Devolver stock del producto anterior
		var productoAnterior models.Product
		if err := tx.First(&productoAnterior, mov.ProductoID).Error; err != nil {
			return c.Status(404).JSON(models.ErrorResponse{Error: "Producto anterior no encontrado"})
		}

		cantAnterior := abs(mov.Cantidad)
		if mov.Tipo == "ENTRADA" {
			if productoAnterior.Stock < uint(cantAnterior) {
				return c.Status(400).JSON(models.ErrorResponse{Error: "Stock insuficiente en producto anterior"})
			}
			productoAnterior.Stock -= uint(cantAnterior)
		} else {
			productoAnterior.Stock += uint(cantAnterior)
		}
		tx.Save(&productoAnterior)

		// Aplicar al nuevo producto
		var productoNuevo models.Product
		if err := tx.First(&productoNuevo, req.ProductoID).Error; err != nil {
			return c.Status(404).JSON(models.ErrorResponse{Error: "Producto nuevo no encontrado"})
		}

		if mov.Tipo == "ENTRADA" {
			productoNuevo.Stock += uint(req.Cantidad)
			mov.Cantidad = req.Cantidad
		} else {
			if productoNuevo.Stock < uint(req.Cantidad) {
				return c.Status(400).JSON(models.ErrorResponse{Error: "Stock insuficiente en producto nuevo"})
			}
			productoNuevo.Stock -= uint(req.Cantidad)
			mov.Cantidad = -req.Cantidad
		}

		mov.ProductoID = req.ProductoID
		tx.Save(&productoNuevo)
		tx.Save(&mov)

		// Cargar el producto en la respuesta
		tx.Preload("Producto").First(&mov, mov.ID)

		return c.JSON(mov)
	})
}

// ============================================
// OBTENER MOVIMIENTOS
// ============================================

func GetMovements(c *fiber.Ctx) error {
	var movimientos []models.Movement

	if err := database.DB.Preload("Producto").Order("fecha desc").Find(&movimientos).Error; err != nil {
		return c.Status(500).JSON(models.ErrorResponse{Error: "Error obteniendo movimientos"})
	}

	return c.JSON(movimientos)
}

func GetMovementByID(c *fiber.Ctx) error {
	id := c.Params("id")

	var movimiento models.Movement
	if err := database.DB.Preload("Producto").First(&movimiento, id).Error; err != nil {
		return c.Status(404).JSON(models.ErrorResponse{Error: "Movimiento no encontrado"})
	}

	return c.JSON(movimiento)
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}
