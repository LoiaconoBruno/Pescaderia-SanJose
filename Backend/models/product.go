package models

import "time"

type Product struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	Codigo        string    `json:"codigo" gorm:"uniqueIndex"`
	Descripcion   string    `json:"descripcion"`
	Stock         uint      `json:"stock"`
	Precio        float64   `json:"precio"`
	CreadoEn      time.Time `json:"creado_en"`
	ActualizadoEn time.Time `json:"actualizado_en"`
}

// TableName especifica el nombre de la tabla en la BD
func (Product) TableName() string {
	return "productos"
}

type CreateProductRequest struct {
	Codigo      string  `json:"codigo" validate:"required"`
	Descripcion string  `json:"descripcion" validate:"required"`
	Stock       uint    `json:"stock" validate:"required"`
	Precio      float64 `json:"precio" validate:"required"`
}

type UpdateProductRequest struct {
	Codigo      string  `json:"codigo"`
	Descripcion string  `json:"descripcion"`
	Stock       uint    `json:"stock"`
	Precio      float64 `json:"precio"`
}
