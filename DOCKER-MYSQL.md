# 🐳 MySQL con Docker - Guía Completa

La forma más fácil y rápida de tener MySQL corriendo para desarrollo.

## 📋 Prerrequisitos

### 1. Instalar Docker Desktop

**Windows:**
- Descarga desde: https://www.docker.com/products/docker-desktop
- Ejecuta el instalador
- Reinicia tu PC si es necesario
- Abre Docker Desktop y espera que inicie

**Verificar instalación:**
```powershell
docker --version
docker-compose --version
```

---

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
# Ejecutar script
.\start-mysql.bat
```

Esto hará:
- ✅ Verificar que Docker esté instalado y corriendo
- ✅ Iniciar MySQL en un contenedor
- ✅ Crear la base de datos `cotizador_laminas`
- ✅ Crear el usuario `juan` con password `Cambiala1234`

### Opción 2: Manual

```bash
# Iniciar MySQL
docker-compose up -d

# Esperar que esté listo (10-20 segundos)
docker logs cotizador-mysql -f
# Presiona Ctrl+C cuando veas "mysqld: ready for connections"

# Verificar que está corriendo
docker ps
```

---

## ✅ Configurar Base de Datos

Una vez que MySQL esté corriendo:

```bash
# 1. Aplicar schema de Prisma
npm run db:push

# 2. Cargar datos de ejemplo
npm run db:seed

# 3. Iniciar servidor Next.js
npm run dev
```

---

## 🔧 Comandos Útiles

### Ver Estado

```bash
# Ver contenedores corriendo
docker ps

# Ver logs de MySQL
docker logs cotizador-mysql -f

# Ver logs en tiempo real
docker-compose logs -f
```

### Conectar a MySQL

```bash
# Desde línea de comandos
docker exec -it cotizador-mysql mysql -u juan -pCambiala1234 cotizador_laminas

# O como root
docker exec -it cotizador-mysql mysql -u root -proot
```

### Detener y Reiniciar

```bash
# Detener MySQL (mantiene los datos)
docker-compose stop

# Reiniciar MySQL
docker-compose start

# Detener y eliminar (borra los datos)
docker-compose down

# Detener y eliminar con volúmenes (limpieza completa)
docker-compose down -v
```

### Limpiar y Empezar de Cero

```bash
# Eliminar todo y empezar limpio
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

---

## 🗄️ Explorar Base de Datos

### Opción 1: Prisma Studio (Recomendado)

```bash
npm run db:studio
```

Abre http://localhost:5555

### Opción 2: MySQL Workbench

1. Descargar: https://dev.mysql.com/downloads/workbench/
2. Conectar con:
   - Host: `localhost`
   - Port: `3306`
   - Username: `juan`
   - Password: `Cambiala1234`

### Opción 3: DBeaver (Gratis)

1. Descargar: https://dbeaver.io/download/
2. Conectar con las mismas credenciales

### Opción 4: Línea de Comandos

```bash
docker exec -it cotizador-mysql mysql -u juan -pCambiala1234 cotizador_laminas
```

Luego puedes ejecutar SQL:
```sql
SHOW TABLES;
SELECT * FROM products;
```

---

## 📊 Información de Conexión

Las credenciales ya están configuradas en tu `.env`:

```env
DATABASE_URL="mysql://juan:Cambiala1234@localhost:3306/cotizador_laminas"
```

**Detalles:**
- **Host:** localhost
- **Puerto:** 3306
- **Base de datos:** cotizador_laminas
- **Usuario:** juan
- **Password:** Cambiala1234
- **Usuario root:** root
- **Password root:** root

---

## 🆘 Problemas Comunes

### Error: "port is already allocated"

Otro servicio está usando el puerto 3306.

**Solución 1: Detener otro MySQL**
```bash
# Windows - detener servicio MySQL
net stop MySQL80

# O desde services.msc buscar "MySQL" y detenerlo
```

**Solución 2: Cambiar puerto de Docker**

Edita `docker-compose.yml`:
```yaml
ports:
  - "3307:3306"  # Usa puerto 3307 en vez de 3306
```

Actualiza `.env`:
```env
DATABASE_URL="mysql://juan:Cambiala1234@localhost:3307/cotizador_laminas"
```

### Error: "Cannot connect to Docker daemon"

Docker Desktop no está corriendo.

**Solución:**
1. Abre Docker Desktop desde el menú inicio
2. Espera que diga "Engine running"
3. Vuelve a ejecutar `docker-compose up -d`

### Error: "Access denied for user"

El contenedor aún no terminó de inicializarse.

**Solución:**
```bash
# Esperar 10-20 segundos
timeout /t 15 /nobreak

# O ver logs hasta que diga "ready for connections"
docker logs cotizador-mysql -f
```

### Error: "Can't reach database server"

El contenedor no está corriendo.

**Solución:**
```bash
# Ver si está corriendo
docker ps

# Si no aparece, iniciarlo
docker-compose up -d

# Ver por qué falló
docker logs cotizador-mysql
```

---

## 🔄 Backup y Restore

### Hacer Backup

```bash
# Backup completo
docker exec cotizador-mysql mysqldump -u root -proot cotizador_laminas > backup.sql

# Backup solo datos
docker exec cotizador-mysql mysqldump -u root -proot --no-create-info cotizador_laminas > backup-data.sql
```

### Restaurar Backup

```bash
# Restaurar desde archivo
docker exec -i cotizador-mysql mysql -u root -proot cotizador_laminas < backup.sql
```

---

## 📝 Docker Compose Explicado

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0           # Imagen de MySQL 8
    container_name: cotizador-mysql  # Nombre del contenedor
    restart: unless-stopped    # Auto-reiniciar
    environment:
      MYSQL_ROOT_PASSWORD: root         # Password de root
      MYSQL_DATABASE: cotizador_laminas # Base de datos inicial
      MYSQL_USER: juan                  # Usuario no-root
      MYSQL_PASSWORD: Cambiala1234      # Password del usuario
    ports:
      - "3306:3306"            # Puerto expuesto
    volumes:
      - mysql_data:/var/lib/mysql  # Datos persistentes
    command: --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:  # Volumen para persistencia de datos
```

---

## 🎯 Workflow Completo

```bash
# 1. Iniciar MySQL
.\start-mysql.bat

# 2. Aplicar schema
npm run db:push

# 3. Cargar datos
npm run db:seed

# 4. Iniciar aplicación
npm run dev

# 5. Explorar datos (opcional)
npm run db:studio

# 6. Cuando termines, detener MySQL
docker-compose down
```

---

## 💡 Tips

1. **Datos persistentes:** Aunque detengas el contenedor, los datos se mantienen en el volumen `mysql_data`

2. **Limpieza completa:** Usa `docker-compose down -v` solo si quieres borrar TODO

3. **Performance:** Docker en Windows puede ser lento. Considera WSL2 para mejor rendimiento

4. **Múltiples proyectos:** Cambia el nombre del contenedor en `docker-compose.yml` si necesitas varias bases de datos

---

## ✅ Verificación Final

Después de configurar, verifica que todo funcione:

```bash
# 1. MySQL corriendo
docker ps | grep cotizador-mysql

# 2. Base de datos creada
docker exec cotizador-mysql mysql -u juan -pCambiala1234 -e "SHOW DATABASES;"

# 3. Tablas creadas
docker exec cotizador-mysql mysql -u juan -pCambiala1234 cotizador_laminas -e "SHOW TABLES;"

# 4. Datos cargados
docker exec cotizador-mysql mysql -u juan -pCambiala1234 cotizador_laminas -e "SELECT COUNT(*) FROM products;"
```

Si todo muestra resultados, ¡estás listo! 🎉

---

## 🔗 Enlaces Útiles

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [MySQL Docker Hub](https://hub.docker.com/_/mysql)
- [Prisma Docs](https://www.prisma.io/docs)

---

**¡Ahora tienes MySQL corriendo con Docker! 🐳**
