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

	c.Locals("user_id", uint(claims["user_id"].(float64)))
	c.Locals("email", claims["email"].(string))

	return c.Next()
}

func SetupRoutes(app *fiber.App) {
	// Auth routes (públicas)
	auth := app.Group("/api/auth")
	auth.Post("/login", controller.SignIn)
	auth.Post("/signup", controller.SignUp)

	// Protected auth routes
	authProtected := app.Group("/api/auth").Use(AuthMiddleware)
	authProtected.Get("/profile", controller.GetProfile)

	// Product routes (requieren autenticación)
	productos := app.Group("/api/productos").Use(AuthMiddleware)
	productos.Post("", controller.CreateProduct)                  // Crear producto
	productos.Get("", controller.GetProducts)                     // Obtener todos
	productos.Get("/:id", controller.GetProductByID)              // Obtener por ID
	productos.Get("/codigo/:codigo", controller.GetProductByCode) // Obtener por código
	productos.Put("/:id", controller.UpdateProduct)               // Actualizar
	productos.Delete("/:id", controller.DeleteProduct)            // Eliminar

	// Movement routes (requieren autenticación)
	movimientos := app.Group("/api/movimientos").Use(AuthMiddleware)
	movimientos.Post("/entrada", controller.CreateInMovement) // Entrada de mercadería
	movimientos.Post("/salida", controller.CreateOutMovement) // Salida de mercadería
	movimientos.Get("", controller.GetMovements)              // Obtener movimientos (con filtros)
	movimientos.Get("/:id", controller.GetMovementByID)       // Obtener un movimiento
}
