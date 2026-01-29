package main

import (
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"sanJoseProyect/database"
	"sanJoseProyect/models"
	"sanJoseProyect/routes"
)

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No se pudo cargar el archivo .env")
	}

	// Variables críticas
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatal("❌ No se pudo cargar la URL de la DB")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Conectar a la base de datos
	database.Connect()

	// Migraciones
	database.DB.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.Movement{},
	)
	log.Println("✅ Migraciones completadas")

	// Inicializar Fiber
	app := fiber.New()

	// =========================
	// CORS
	// =========================
	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins: strings.Join([]string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:5173",
			"http://localhost:5137",
			"https://loiaconobruno.github.io",
			"https://mcldesarrolloweb.com",
			"https://www.mcldesarrolloweb.com", // ✨ Agregado dominio con www
		}, ","),
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type,Authorization",
	}))

	// Rutas
	routes.SetupRoutes(app)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// Levantar servidor
	addr := ":" + port
	log.Println("✅ Servidor corriendo en", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("❌ Error al iniciar el servidor: %v", err)
	}
}
