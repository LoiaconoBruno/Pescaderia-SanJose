package models

import "time"

type Movement struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	ProductoID    uint      `json:"producto_id"`
	Producto      *Product  `json:"producto" gorm:"foreignKey:ProductoID"`
	NumeroFactura string    `json:"numero_factura"` // Número de factura (puede ser vacío para salidas)
	Fecha         time.Time `json:"fecha"`
	Codigo        string    `json:"codigo"`      // Código del producto
	Descripcion   string    `json:"descripcion"` // Descripción del producto
	Cantidad      int       `json:"cantidad"`    // Positivo para entrada, negativo para salida
	Tipo          string    `json:"tipo"`        // "ENTRADA" para entrada, "SALIDA" para salida
	CreadoEn      time.Time `json:"creado_en"`
	ActualizadoEn time.Time `json:"actualizado_en"`
}

// TableName especifica el nombre de la tabla en la BD
func (Movement) TableName() string {
	return "movimientos"
}

type CreateInMovementRequest struct {
	NumeroFactura string `json:"numero_factura" validate:"required"`
	Fecha         string `json:"fecha" validate:"required"` // Formato: 2024-01-15
	Codigo        string `json:"codigo" validate:"required"`
	Descripcion   string `json:"descripcion" validate:"required"`
	Cantidad      int    `json:"cantidad" validate:"required,min=1"`
}

type CreateOutMovementRequest struct {
	Fecha       string `json:"fecha" validate:"required"` // Formato: 2024-01-15
	Codigo      string `json:"codigo" validate:"required"`
	Descripcion string `json:"descripcion" validate:"required"`
	Cantidad    int    `json:"cantidad" validate:"required,min=1"`
}

type MovementResponse struct {
	ID            uint      `json:"id"`
	ProductoID    uint      `json:"producto_id"`
	NumeroFactura string    `json:"numero_factura"`
	Fecha         time.Time `json:"fecha"`
	Codigo        string    `json:"codigo"`
	Descripcion   string    `json:"descripcion"`
	Cantidad      int       `json:"cantidad"`
	Tipo          string    `json:"tipo"`
	CreadoEn      time.Time `json:"creado_en"`
}
