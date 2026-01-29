package models

import (
	"database/sql/driver"
	"fmt"
	"time"
)

// CustomDate para serializar solo fecha sin hora
type CustomDate struct {
	time.Time
}

// MarshalJSON formatea la fecha como "2006-01-02"
func (cd CustomDate) MarshalJSON() ([]byte, error) {
	// Asegurarse de que la fecha se formatee en la zona horaria local
	return []byte(`"` + cd.Time.In(time.Local).Format("2006-01-02") + `"`), nil
}

// UnmarshalJSON parsea la fecha desde "2006-01-02"
func (cd *CustomDate) UnmarshalJSON(b []byte) error {
	s := string(b)
	s = s[1 : len(s)-1] // quitar comillas
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return err
	}
	// Establecer la fecha en la zona horaria local
	cd.Time = time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.Local)
	return nil
}

// Value implementa driver.Valuer para GORM - guarda solo la fecha en la BD
func (cd CustomDate) Value() (driver.Value, error) {
	if cd.Time.IsZero() {
		return nil, nil
	}
	// Retorna solo la fecha en formato "2006-01-02"
	return cd.Time.Format("2006-01-02"), nil
}

// Scan implementa sql.Scanner para GORM - lee la fecha desde la BD
func (cd *CustomDate) Scan(value interface{}) error {
	if value == nil {
		cd.Time = time.Time{}
		return nil
	}

	switch v := value.(type) {
	case time.Time:
		// Normalizar a la zona horaria local, hora 00:00:00
		cd.Time = time.Date(v.Year(), v.Month(), v.Day(), 0, 0, 0, 0, time.Local)
		return nil
	case string:
		t, err := time.Parse("2006-01-02", v)
		if err != nil {
			return err
		}
		cd.Time = time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.Local)
		return nil
	case []byte:
		t, err := time.Parse("2006-01-02", string(v))
		if err != nil {
			return err
		}
		cd.Time = time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.Local)
		return nil
	default:
		return fmt.Errorf("no se puede convertir %T a CustomDate", value)
	}
}

// Movement model
type Movement struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	ProductoID    uint       `json:"producto_id"`
	Producto      *Product   `json:"producto,omitempty" gorm:"foreignKey:ProductoID"`
	NumeroFactura int        `json:"numero_factura"`
	Fecha         CustomDate `json:"fecha" gorm:"type:date"`
	Descripcion   string     `json:"descripcion"`
	Cantidad      int        `json:"cantidad"`
	Tipo          string     `json:"tipo"`
	Estado        bool       `json:"estado"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

func (Movement) TableName() string {
	return "movimientos"
}

// Request DTOs
type CreateInMovementRequest struct {
	NumeroFactura int    `json:"numero_factura" validate:"required"`
	Fecha         string `json:"fecha" validate:"required"`
	ProductoID    uint   `json:"producto_id" validate:"required"`
	Descripcion   string `json:"descripcion" validate:"required"`
	Cantidad      int    `json:"cantidad" validate:"required,min=1"`
}

type CreateOutMovementRequest struct {
	Fecha       string `json:"fecha" validate:"required"`
	ProductoID  uint   `json:"producto_id" validate:"required"`
	Descripcion string `json:"descripcion" validate:"required"`
	Cantidad    int    `json:"cantidad" validate:"required,min=1"`
}

type UpdateMovementRequest struct {
	Cantidad int `json:"cantidad" validate:"required,min=1"`
}

type UpdateMovementProductRequest struct {
	ProductoID uint `json:"producto_id" validate:"required"`
	Cantidad   int  `json:"cantidad" validate:"required,min=1"`
}

type MovementResponse struct {
	ID            uint       `json:"id"`
	ProductoID    uint       `json:"producto_id"`
	NumeroFactura int        `json:"numero_factura"`
	Fecha         CustomDate `json:"fecha"`
	Descripcion   string     `json:"descripcion"`
	Cantidad      int        `json:"cantidad"`
	Tipo          string     `json:"tipo"`
	Estado        bool       `json:"estado"`
	CreadoEn      time.Time  `json:"creado_en"`
}
