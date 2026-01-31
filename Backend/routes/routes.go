package routes

import (
	"fmt"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"sanJoseProyect/controller"
)

func AuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Missing authorization header",
		})
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid authorization format",
		})
	}

	tokenString := parts[1]
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key-change-in-production"
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil || !token.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token",
		})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid token claims",
		})
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid user_id claim",
		})
	}

	email, ok := claims["email"].(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email claim",
		})
	}

	c.Locals("user_id", uint(userIDFloat))
	c.Locals("email", email)

	return c.Next()
}

func SetupRoutes(app *fiber.App) {
	// =========================
	// AUTH (públicas)
	// =========================
	auth := app.Group("/api/auth")
	auth.Post("/login", controller.SignIn)
	auth.Post("/signup", controller.SignUp)

	// Auth protegidas
	authProtected := app.Group("/api/auth").Use(AuthMiddleware)
	authProtected.Get("/profile", controller.GetProfile)

	// =========================
	// PRODUCTOS (protegidas)
	// =========================
	productos := app.Group("/api/productos").Use(AuthMiddleware)
	productos.Post("/", controller.CreateProduct)
	productos.Get("/", controller.GetProducts)
	productos.Get("/codigo/:codigo", controller.GetProductByCodigo)
	productos.Get("/:id", controller.GetProductByID)
	productos.Get("/:id/movimientos", controller.GetMovementsByProductID) // ✨ NUEVA RUTA
	productos.Put("/:id", controller.UpdateProduct)
	productos.Delete("/:id", controller.DeleteProduct)

	// =========================
	// MOVIMIENTOS/FACTURAS (protegidas)
	// =========================
	movimientos := app.Group("/api/movimientos").Use(AuthMiddleware)
	// Rutas fijas primero
	movimientos.Post("/entrada", controller.CreateInMovement)
	movimientos.Post("/salida", controller.CreateOutMovement)
	movimientos.Get("/", controller.GetMovements)

	// ✨ ACTUALIZADO: Solo anula si Estado = true
	movimientos.Put("/:id/cancelar", controller.CancelMovement)

	// ✨ Modificar cantidad del mismo producto
	movimientos.Put("/:id/editar-cantidad", controller.UpdateMovementQuantity)

	// ✨ NUEVO: Cambiar el producto completo
	movimientos.Put("/:id/editar-producto", controller.UpdateMovementProduct)

	// Paramétrica al final
	movimientos.Get("/:id", controller.GetMovementByID)
}
