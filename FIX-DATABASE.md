# 🔧 Solución: Error de Acceso a MySQL

## ❌ Error Actual

```
Access denied for user 'root'@'localhost'
```

Esto significa que MySQL no permite la conexión con las credenciales actuales.

---

## ✅ Soluciones

### Solución 1: Configurar Password en MySQL (Recomendado)

#### Windows (MySQL nativo):

```powershell
# 1. Abrir MySQL como administrador
mysql -u root -p
# (Si no tiene password, presiona Enter)

# 2. Dentro de MySQL, crear/cambiar password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'tu_nuevo_password';
FLUSH PRIVILEGES;
EXIT;
```

#### WSL/Linux:

```bash
# 1. Conectar a MySQL
sudo mysql

# 2. Crear password para root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'tu_nuevo_password';
FLUSH PRIVILEGES;
EXIT;
```

#### Luego, actualiza tu `.env`:

```env
DATABASE_URL="mysql://root:tu_nuevo_password@localhost:3306/cotizador_laminas"
```

---

### Solución 2: Usar MySQL sin Password (Solo Desarrollo)

Si prefieres no usar password (NO recomendado para producción):

#### Windows:

```powershell
# En MySQL
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

Actualiza `.env`:

```env
DATABASE_URL="mysql://root@localhost:3306/cotizador_laminas"
```

---

### Solución 3: Crear Usuario Nuevo (Más Seguro)

```sql
-- Conectar a MySQL como root
mysql -u root -p

-- Crear nuevo usuario
CREATE USER 'cotizador'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON cotizador_laminas.* TO 'cotizador'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Actualiza `.env`:

```env
DATABASE_URL="mysql://cotizador:password_seguro@localhost:3306/cotizador_laminas"
```

---

## 🔍 Verificar Conexión

Después de configurar, prueba la conexión:

```bash
# Regenerar cliente Prisma
npm run db:generate

# Probar conexión
npm run db:push

# Si funciona, cargar datos
npm run db:seed
```

---

## 🐧 Para WSL Específicamente

Si estás en WSL y acabas de instalar MySQL/MariaDB:

```bash
# 1. Iniciar MySQL
sudo service mysql start

# 2. Conectar sin password (primera vez)
sudo mysql

# 3. Dentro de MySQL, configurar root
USE mysql;
UPDATE user SET plugin='mysql_native_password' WHERE User='root';
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EXIT;

# 4. Ahora puedes conectar sin sudo
mysql -u root

# 5. Crear la base de datos
CREATE DATABASE IF NOT EXISTS cotizador_laminas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Actualiza tu `.env`:

```env
DATABASE_URL="mysql://root@localhost:3306/cotizador_laminas"
```

---

## 📝 Pasos Completos para WSL

```bash
# 1. Iniciar MySQL
sudo service mysql start

# 2. Configurar MySQL (sin password para desarrollo)
sudo mysql -e "UPDATE mysql.user SET plugin='mysql_native_password' WHERE User='root';"
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 3. Crear base de datos
mysql -u root -e "CREATE DATABASE IF NOT EXISTS cotizador_laminas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Configurar .env
echo 'DATABASE_URL="mysql://root@localhost:3306/cotizador_laminas"' > .env

# 5. Aplicar schema
npm run db:generate
npm run db:push

# 6. Cargar datos
npm run db:seed
```

---

## ✅ Verificación Final

```bash
# Ver que MySQL está corriendo
# WSL/Linux:
sudo service mysql status

# Windows:
# services.msc → buscar "MySQL"

# Probar conexión
mysql -u root -p
# (ingresa tu password o Enter si no tiene)

# Ver bases de datos
SHOW DATABASES;

# Debería aparecer 'cotizador_laminas'
```

---

## 🆘 Si Nada Funciona

Ejecuta este comando para resetear completamente MySQL en WSL:

```bash
sudo apt remove --purge mysql-server mariadb-server -y
sudo apt autoremove -y
sudo apt clean
sudo rm -rf /var/lib/mysql
sudo apt install mariadb-server -y
sudo service mysql start
```

Luego sigue los pasos de configuración de arriba.

---

## 💡 Recomendación

Para desarrollo local, la opción más simple es:

1. **Sin password** en WSL/desarrollo
2. **Con password seguro** en producción

Actualiza tu `.env` según la opción que elijas y ejecuta:

```bash
npm run db:push
npm run db:seed
npm run dev
```

¡Listo! 🎉
