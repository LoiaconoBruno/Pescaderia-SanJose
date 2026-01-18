package models

import "time"

// CustomDate para serializar solo fecha sin hora
type CustomDate struct {
	time.Time
}

// MarshalJSON formatea la fecha como "2006-01-02"
func (cd CustomDate) MarshalJSON() ([]byte, error) {
	return []byte(`"` + cd.Time.Format("2006-01-02") + `"`), nil
}

// UnmarshalJSON parsea la fecha desde "2006-01-02"
func (cd *CustomDate) UnmarshalJSON(b []byte) error {
	s := string(b)
	s = s[1 : len(s)-1] // quitar comillas
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return err
	}
	cd.Time = t
	return nil
}

type Movement struct {
	ID            uint       `json:"id" gorm:"primaryKey"`
	ProductoID    uint       `json:"producto_id"`
	Producto      *Product   `json:"producto,omitempty" gorm:"foreignKey:ProductoID"`
	NumeroFactura int        `json:"numero_factura"`         // ✨ AHORA ES ENTERO
	Fecha         CustomDate `json:"fecha" gorm:"type:date"` // ✨ Solo fecha
	Descripcion   string     `json:"descripcion"`
	Cantidad      int        `json:"cantidad"` // ENTRADA:+ , SALIDA:-
	Tipo          string     `json:"tipo"`     // "ENTRADA" o "SALIDA"
	Estado        bool       `json:"estado"`   // true activa, false anulada
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

func (Movement) TableName() string {
	return "movimientos"
}

type CreateInMovementRequest struct {
	NumeroFactura int    `json:"numero_factura" validate:"required"` // ✨ ENTERO
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

// ✨ NUEVO: Request para cambiar el producto de un movimiento
type UpdateMovementProductRequest struct {
	ProductoID uint `json:"producto_id" validate:"required"`
	Cantidad   int  `json:"cantidad" validate:"required,min=1"`
}

type MovementResponse struct {
	ID            uint       `json:"id"`
	ProductoID    uint       `json:"producto_id"`
	NumeroFactura int        `json:"numero_factura"` // ✨ ENTERO
	Fecha         CustomDate `json:"fecha"`          // ✨ Solo fecha
	Descripcion   string     `json:"descripcion"`
	Cantidad      int        `json:"cantidad"`
	Tipo          string     `json:"tipo"`
	Estado        bool       `json:"estado"`
	CreadoEn      time.Time  `json:"creado_en"`
}
