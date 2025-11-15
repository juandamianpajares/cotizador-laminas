# Script de Aprovisionamiento Hardened v2.0

Script completo de aprovisionamiento para servidores Linux con hardening de seguridad, soporte para Debian 14, Ubuntu 25, y configuración automática de proyectos.

## 🚀 Características

### Seguridad (Hardening)
- ✅ Hardening del kernel (sysctl)
- ✅ Configuración SSH hardened (solo claves, sin root)
- ✅ Firewall (UFW/Firewalld) con reglas restrictivas
- ✅ Fail2Ban para protección contra brute-force
- ✅ Actualizaciones automáticas de seguridad
- ✅ Sistema de auditoría (auditd)
- ✅ Límites del sistema optimizados

### Gestión de Proyectos
- ✅ Clonado automático desde GitHub
- ✅ Detección automática de tipo de proyecto (Docker/LAMP)
- ✅ Configuración de ambientes (dev/stage/prod)
- ✅ Generación automática de archivos .env
- ✅ Despliegue automático de contenedores Docker

### SSH y GitHub
- ✅ Generación automática de claves SSH (Ed25519)
- ✅ Configuración de SSH para GitHub
- ✅ Soporte para claves SSH proporcionadas
- ✅ Verificación de conectividad

## 📋 Requisitos

- Debian 11+ / Ubuntu 20.04+ / Arch Linux
- Usuario con privilegios sudo
- Conexión a Internet

## 🔧 Uso Básico

### Modo Interactivo

```bash
sudo bash provision.sh
```

El script mostrará un menú con las siguientes opciones:

1. **Instalación completa con hardening + proyecto** - Todo incluido
2. **Solo hardening de seguridad** - Sin instalación de aplicaciones
3. **Instalar LAMP local** - Apache, MariaDB, PHP
4. **Instalar Docker** - Docker Engine con hardening
5. **Configurar proyecto desde repositorio** - Clona y configura tu proyecto
6. **Configurar firewall** - Solo UFW/Firewalld
7. **Configurar SSH hardened** - Solo configuración SSH
8. **Configurar SSH para GitHub** - Solo claves SSH
9. **Salir**

### Modo Automático con Variables de Entorno

Para automatización completa, puedes pasar variables de entorno:

```bash
# Ejemplo completo: Instalación con hardening + proyecto
PROJECT_REPO_URL="git@github.com:usuario/repo.git" \
PROJECT_ENVIRONMENT="prod" \
PROJECT_DIR="/opt/mi-app" \
SSH_PORT=2222 \
FAIL2BAN_ENABLED=true \
AUTO_UPDATES_ENABLED=true \
sudo -E bash provision.sh
```

## 🌍 Variables de Entorno

### Configuración de Seguridad

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SSH_PORT` | Puerto SSH personalizado | `22` |
| `FAIL2BAN_ENABLED` | Habilitar Fail2Ban | `true` |
| `AUTO_UPDATES_ENABLED` | Actualizaciones automáticas | `true` |

### Configuración del Proyecto

| Variable | Descripción | Default | Ejemplo |
|----------|-------------|---------|---------|
| `PROJECT_REPO_URL` | URL del repositorio Git | - | `git@github.com:user/repo.git` |
| `PROJECT_ENVIRONMENT` | Ambiente del proyecto | `dev` | `dev`, `stage`, `prod` |
| `PROJECT_TYPE` | Tipo de proyecto | Auto-detectado | `docker`, `lamp` |
| `PROJECT_DIR` | Directorio del proyecto | `/opt/app` | `/var/www/mi-app` |
| `SETUP_GITHUB_SSH` | Configurar SSH para GitHub | `true` | `true`, `false` |
| `SSH_KEY_PATH` | Ruta a clave SSH existente | - | `/home/user/.ssh/id_ed25519` |

## 📝 Ejemplos de Uso

### Ejemplo 1: Instalación Completa en Producción

```bash
# Servidor de producción con puerto SSH personalizado
PROJECT_REPO_URL="git@github.com:juandamianpajares/cotizador-laminas.git" \
PROJECT_ENVIRONMENT="prod" \
PROJECT_DIR="/opt/cotizador" \
SSH_PORT=2222 \
sudo -E bash provision.sh
# Selecciona opción 1 en el menú
```

### Ejemplo 2: Solo Configurar Proyecto Existente

```bash
# Ya tienes el servidor configurado, solo quieres deployar
PROJECT_REPO_URL="git@github.com:user/repo.git" \
PROJECT_ENVIRONMENT="dev" \
PROJECT_DIR="/home/user/mi-proyecto" \
sudo -E bash provision.sh
# Selecciona opción 5 en el menú
```

### Ejemplo 3: Usar Clave SSH Existente

```bash
# Si ya tienes una clave SSH que quieres usar
SSH_KEY_PATH="/ruta/a/tu/clave/id_ed25519" \
PROJECT_REPO_URL="git@github.com:user/repo.git" \
sudo -E bash provision.sh
# Selecciona opción 8 o 5
```

### Ejemplo 4: Solo Hardening (Sin Proyecto)

```bash
# Solo aplicar hardening de seguridad
SSH_PORT=2222 \
FAIL2BAN_ENABLED=true \
sudo -E bash provision.sh
# Selecciona opción 2
```

## 🐳 Proyectos Docker

Para proyectos Docker, el script:

1. Detecta automáticamente si existe `docker-compose.yml` o `docker-compose.dev.yml`
2. Instala Docker si no está presente
3. Crea archivo `.env` según el ambiente seleccionado
4. Selecciona el archivo docker-compose correcto:
   - `dev` → `docker-compose.dev.yml`
   - `stage` → `docker-compose.stage.yml`
   - `prod` → `docker-compose.prod.yml` o `docker-compose.yml`
5. Construye e inicia los contenedores
6. Configura el firewall para los puertos necesarios

### Archivos .env Generados

#### Desarrollo
```env
NODE_ENV=development
MYSQL_ROOT_PASSWORD=DevPass123
MYSQL_DATABASE=cotizador_laminas
MYSQL_USER=juan
MYSQL_PASSWORD=DevPass123
MYSQL_PORT=3306
APP_PORT=3000
PHPMYADMIN_PORT=8080
```

#### Producción
```env
NODE_ENV=production
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 32)
MYSQL_DATABASE=cotizador_laminas
MYSQL_USER=appuser
MYSQL_PASSWORD=$(openssl rand -base64 32)
MYSQL_PORT=3306
APP_PORT=3000
PHPMYADMIN_PORT=8080
```

## 🔒 Configuración de SSH

### Claves SSH Generadas Automáticamente

El script genera claves Ed25519 (más seguras que RSA) con el formato:
```
~/.ssh/id_ed25519
~/.ssh/id_ed25519.pub
```

### Configuración SSH Hardened

El script aplica las siguientes configuraciones de seguridad en `/etc/ssh/sshd_config`:

- ✅ Solo autenticación por clave pública
- ✅ PermitRootLogin deshabilitado
- ✅ Máximo 3 intentos de autenticación
- ✅ Algoritmos de cifrado modernos (ChaCha20, AES-GCM)
- ✅ Forwarding deshabilitado
- ✅ Timeouts configurados

### Agregar Clave a GitHub

El script muestra la clave pública y te guía:

1. Copia la clave pública mostrada en pantalla
2. Ve a https://github.com/settings/ssh/new
3. Pega la clave y asigna un título
4. El script verifica la conexión automáticamente

## 🛡️ Hardening Aplicado

### Kernel y Red

- Protección contra IP spoofing
- SYN flood protection
- ICMP redirects deshabilitados
- Source routing deshabilitado
- Martian packets logging
- TCP time-wait protection

### Sistema de Archivos

- Protección de enlaces simbólicos
- Protección de hardlinks
- Protección de FIFOs
- Core dumps limitados
- ASLR habilitado

### Firewall

**Políticas:**
- Deny all incoming (por defecto)
- Allow all outgoing
- Allow SSH (puerto configurable)
- Allow HTTP (80)
- Allow HTTPS (443)
- Rate limiting en SSH

### Fail2Ban

- Ban después de 3 intentos fallidos
- Tiempo de ban: 1-2 horas
- Protección contra SSH DDoS

## 📊 Reporte de Seguridad

Al finalizar, el script muestra un reporte con:

- Sistema operativo detectado
- Puerto SSH configurado
- Estado del firewall
- Estado de Fail2Ban
- Estado de Docker
- Tareas pendientes

## 🔧 Post-Instalación

### Tareas Recomendadas

1. **Si instalaste LAMP:**
   ```bash
   sudo mysql_secure_installation
   ```

2. **Verificar firewall:**
   ```bash
   sudo ufw status verbose
   ```

3. **Monitorear logs:**
   ```bash
   sudo journalctl -f
   sudo tail -f /var/log/fail2ban.log
   ```

4. **Verificar Docker (si aplica):**
   ```bash
   docker ps
   docker compose logs -f
   ```

5. **Cerrar sesión y volver a entrar** para aplicar cambios de grupo

## 🐛 Troubleshooting

### Error: "No se ha podido localizar el paquete"

El script maneja automáticamente paquetes que pueden no estar disponibles en todas las versiones. Los paquetes opcionales se saltan sin detener la ejecución.

### Error: Formato de archivo incorrecto

Si el archivo fue editado en Windows:
```bash
sed -i 's/\r$//' provision.sh
chmod +x provision.sh
```

### Error: Docker no se conecta

Después de instalar Docker, cierra sesión y vuelve a entrar:
```bash
logout
# O reinicia el servidor
sudo reboot
```

### SSH no permite conexión después del hardening

Si te quedas sin acceso SSH:
- Usa la consola del servidor (acceso físico o panel de control)
- Restaura el backup: `sudo cp /etc/ssh/sshd_config.bak.* /etc/ssh/sshd_config`
- Reinicia SSH: `sudo systemctl restart sshd`

## 📁 Estructura de Directorios

```
/opt/app/                    # Proyecto por defecto
/etc/sysctl.d/99-hardening.conf    # Hardening del kernel
/etc/security/limits.d/99-custom.conf  # Límites del sistema
/etc/ssh/sshd_config         # SSH hardened
/etc/fail2ban/jail.local     # Fail2Ban
/etc/docker/daemon.json      # Docker hardened
~/.ssh/                      # Claves SSH
~/.ssh/config                # Configuración SSH
```

## 🔄 Actualización del Script

Para actualizar el script:
```bash
git pull origin main
sed -i 's/\r$//' provision.sh
chmod +x provision.sh
```

## 📞 Soporte

- GitHub Issues: https://github.com/usuario/repo/issues
- Documentación: https://github.com/usuario/repo/wiki

## 📜 Licencia

Este script es de código abierto y puede ser usado libremente.

## ⚠️ Advertencias

- **Producción**: Revisa cuidadosamente las configuraciones antes de usar en producción
- **Backups**: El script crea backups automáticos de archivos críticos
- **Contraseñas**: En producción, usa contraseñas seguras generadas aleatoriamente
- **Firewall**: Asegúrate de mantener acceso SSH antes de habilitar el firewall

## 🎯 Roadmap

- [ ] Soporte para más distribuciones (Alpine, Rocky Linux)
- [ ] Integración con Ansible
- [ ] Monitoreo con Prometheus/Grafana
- [ ] Backup automático
- [ ] Certificados SSL con Let's Encrypt
