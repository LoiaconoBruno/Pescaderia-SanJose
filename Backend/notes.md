Aquí están todas las URLs con sus métodos:

## 🔐 **AUTENTICACIÓN**

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `http://localhost:8080/api/auth/signup` | Registrarse |
| POST | `http://localhost:8080/api/auth/login` | Iniciar sesión |
| GET | `http://localhost:8080/api/auth/profile` | Obtener perfil (requiere token) |

---

## 📦 **PRODUCTOS**

| Método | URL | Descripción | Requiere Token |
|--------|-----|-------------|----------------|
| POST | `http://localhost:8080/api/productos` | Crear producto | ✅ |
| GET | `http://localhost:8080/api/productos` | Obtener todos los productos | ✅ |
| GET | `http://localhost:8080/api/productos/:id` | Obtener producto por ID | ✅ |
| GET | `http://localhost:8080/api/productos/codigo/:codigo` | Obtener producto por código | ✅ |
| PUT | `http://localhost:8080/api/productos/:id` | Actualizar producto | ✅ |
| DELETE | `http://localhost:8080/api/productos/:id` | Eliminar producto | ✅ |

---

## 📊 **MOVIMIENTOS**

| Método | URL | Descripción | Requiere Token |
|--------|-----|-------------|----------------|
| POST | `http://localhost:8080/api/movimientos/entrada` | Registrar entrada de mercadería | ✅ |
| POST | `http://localhost:8080/api/movimientos/salida` | Registrar salida de mercadería | ✅ |
| GET | `http://localhost:8080/api/movimientos` | Obtener todos los movimientos | ✅ |
| GET | `http://localhost:8080/api/movimientos?tipo=ENTRADA&codigo=PROD001&fecha_inicio=2024-01-01&fecha_fin=2024-01-31` | Obtener movimientos con filtros | ✅ |
| GET | `http://localhost:8080/api/movimientos/:id` | Obtener un movimiento por ID | ✅ |

---

## ✅ **HEALTH CHECK**

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `http://localhost:8080/health` | Verificar que el servidor está activo |

---

**Nota:** Las URLs con ✅ en "Requiere Token" necesitan el header:
```
Authorization: Bearer {tu_token_aqui}
```
