# Guía de Instalación - Cotizador de Láminas

Sistema completo en Next.js 15 con soporte para MySQL usando Prisma ORM.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- MySQL 8.0+ instalado y corriendo
- npm o yarn

### Para WSL (Windows Subsystem for Linux)

Si vas a usar WSL, necesitas:
- WSL2 instalado y configurado
- Node.js 18+ instalado en WSL
- MySQL instalado en WSL O acceso a MySQL en Windows
- npm instalado en WSL

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <tu-repo>
cd cotizador-laminas
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos MySQL

#### Para WSL: Instalación de MySQL

**Opción 1: MySQL en WSL (Recomendado)**

```bash
# Actualizar paquetes
sudo apt update

# Instalar MySQL
sudo apt install mysql-server -y

# Iniciar MySQL
sudo service mysql start

# Configurar MySQL (opcional, establecer password de root)
sudo mysql_secure_installation

# Acceder a MySQL
sudo mysql
```

**Opción 2: Usar MySQL de Windows desde WSL**

Si ya tienes MySQL en Windows, obtén la IP del host:

```bash
# Obtener IP de Windows desde WSL
cat /etc/resolv.conf | grep nameserver | awk '{print $2}'

# Usar esa IP en tu DATABASE_URL
# Ejemplo: DATABASE_URL="mysql://root:password@172.X.X.X:3306/cotizador_laminas"
```

#### Opción A: MySQL Local (Linux/Mac/Windows nativo)

1. Crear la base de datos:

```sql
CREATE DATABASE cotizador_laminas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Crear un usuario (opcional):

```sql
CREATE USER 'cotizador'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON cotizador_laminas.* TO 'cotizador'@'localhost';
FLUSH PRIVILEGES;
```

#### Opción B: MySQL con Docker

```bash
docker run --name mysql-cotizador \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=cotizador_laminas \
  -p 3306:3306 \
  -d mysql:8.0
```

### 4. Configurar Variables de Entorno

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
DATABASE_URL="mysql://root:root@localhost:3306/cotizador_laminas"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Formato de DATABASE_URL:**
```
mysql://[usuario]:[password]@[host]:[puerto]/[nombre_db]
```

### 5. Generar Cliente Prisma y Ejecutar Migraciones

```bash
# Generar el cliente Prisma
npm run db:generate

# Aplicar el schema a la base de datos
npm run db:push
```

### 6. Cargar Datos Iniciales (Opcional)

Puedes crear un script para cargar productos iniciales o hacerlo manualmente a través de la API.

#### Crear productos de ejemplo vía API:

Inicia el servidor primero:

```bash
npm run dev
```

Luego usa curl o Postman:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SEC-CLEAR-4",
    "name": "Laminado Seguridad Clear 4mil",
    "description": "Film de seguridad transparente 4mil",
    "category": "LAMINATE_SECURITY",
    "pricePerSqm": 25.00,
    "installationPerSqm": 15.00,
    "specifications": {
      "thickness": "4mil",
      "uv_protection": "99%"
    }
  }'
```

### 7. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El sistema estará disponible en: http://localhost:3000

## 📊 Explorar la Base de Datos

Prisma incluye una herramienta visual para explorar los datos:

```bash
npm run db:studio
```

Esto abrirá Prisma Studio en http://localhost:5555

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar linter

# Scripts de Prisma
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar schema a DB (desarrollo)
npm run db:migrate   # Crear y aplicar migración (producción)
npm run db:studio    # Abrir Prisma Studio
```

## 🔧 Configuración de Producción

### 1. Variables de Entorno de Producción

```env
DATABASE_URL="mysql://user:password@production-host:3306/cotizador_laminas?sslaccept=strict"
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

### 2. Ejecutar Migraciones

En producción, usa migraciones en lugar de `db:push`:

```bash
npx prisma migrate deploy
```

### 3. Build y Deploy

```bash
npm run build
npm run start
```

## 🗄️ Estructura de la Base de Datos

El sistema incluye las siguientes tablas principales:

- **customers**: Clientes
- **products**: Catálogo de films y laminados
- **quotations**: Cotizaciones generadas
- **quotation_items**: Items individuales de cada cotización
- **properties**: Propiedades (residencial/comercial)
- **rooms**: Habitaciones
- **openings**: Aberturas (ventanas, puertas, etc.)

Ver [prisma/schema.prisma](prisma/schema.prisma) para el schema completo.

## 🧪 Probar el Sistema

### 1. Crear Productos

Accede a `/api/products` (POST) para crear productos de films.

### 2. Crear Cotización

Usa el formulario web en la página principal o la API:

```bash
POST /api/quotations
```

### 3. Calcular Cotización

```bash
POST /api/quotations/calculate
```

## 📝 Modelo de Datos de Ejemplo

### Crear Cotización Residencial

```json
{
  "vertical": "residential",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+54 11 1234-5678",
    "whatsapp": "+54 11 1234-5678"
  },
  "property": {
    "type": "house",
    "address": "Av. Corrientes 1234",
    "city": "Buenos Aires",
    "floors": 2
  },
  "rooms": [
    {
      "name": "Sala Principal",
      "type": "living_room",
      "floor": 1,
      "openings": [
        {
          "id": "opening-1",
          "type": "window",
          "name": "Ventana delantera",
          "width": 2.0,
          "height": 1.5,
          "quantity": 2,
          "productId": "uuid-del-producto",
          "specifications": {
            "glassType": "tempered",
            "floor": 1
          }
        }
      ]
    }
  ]
}
```

## 🚨 Troubleshooting

### Error: "Can't reach database server"

- Verifica que MySQL esté corriendo
- Revisa las credenciales en `.env`
- Verifica el puerto (default: 3306)

### Error: "Invalid `prisma.xxx()` invocation"

```bash
npm run db:generate
```

### Error: "Table doesn't exist"

```bash
npm run db:push
```

### Puerto 3000 en uso

```bash
# Cambiar puerto
PORT=3001 npm run dev
```

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de MySQL](https://dev.mysql.com/doc/)

## 🤝 Soporte

Si tienes problemas, revisa:

1. Logs del servidor (`npm run dev`)
2. Logs de MySQL
3. Variables de entorno en `.env`
4. Schema de Prisma está sincronizado

## 🎉 ¡Listo!

Tu sistema de cotización está configurado y listo para usar.

Accede a http://localhost:3000 para empezar a crear cotizaciones.
