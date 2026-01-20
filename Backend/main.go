package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"sanJoseProyect/database"
	"sanJoseProyect/models"
	"sanJoseProyect/routes"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No se pudo cargar el archivo .env")
	}

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

	// Migrar modelos
	database.DB.AutoMigrate(&models.User{})
	database.DB.AutoMigrate(&models.Product{})
	database.DB.AutoMigrate(&models.Movement{})

	log.Println("✅ Migraciones completadas")

	// Inicializar servidor Fiber
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:5137,https://loiaconobruno.github.io",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Content-Type,Authorization",
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
	fmt.Println("✅ Servidor corriendo en http://localhost" + addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("❌ Error al iniciar el servidor: %v", err)
	}
}
