package models

import "time"

type Product struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	Codigo       int        `json:"codigo" gorm:"unique;not null"`
	Descripcion  string     `json:"descripcion"`
	StockInicial uint       `json:"stock_inicial" gorm:"default:0"` // ⭐ NUEVO CAMPO
	Stock        uint       `json:"stock"`
	TipoCantidad string     `json:"tipo_cantidad" gorm:"type:varchar(20);default:'unidades'"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	Movements    []Movement `json:"movements,omitempty" gorm:"foreignKey:ProductoID"`
}

func (Product) TableName() string {
	return "productos"
}

type CreateProductRequest struct {
	Codigo       int    `json:"codigo" validate:"required"`
	Descripcion  string `json:"descripcion" validate:"required"`
	Stock        uint   `json:"stock" validate:"required"`
	TipoCantidad string `json:"tipo_cantidad"`
}

type UpdateProductRequest struct {
	Codigo       *int   `json:"codigo,omitempty"`
	Descripcion  string `json:"descripcion"`
	Stock        uint   `json:"stock"`
	TipoCantidad string `json:"tipo_cantidad,omitempty"`
}
