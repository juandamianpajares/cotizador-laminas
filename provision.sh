#!/bin/bash

#===============================================================================
# Script de Aprovisionamiento Hardened para Servidores Linux
# Soporta: Debian 14, Ubuntu 25, y otras distribuciones modernas
# Incluye: Hardening de seguridad, configuración de red y firewall
#===============================================================================

set -euo pipefail
IFS=$'\n\t'

# Colores para output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

# Variables globales de detección
OS=""
OS_VERSION=""
INSTALL_OPTION=""
FIREWALL_ENABLED=false
NETWORK_CONFIGURED=false

# Variables de configuración de seguridad
readonly SSH_PORT="${SSH_PORT:-22}"
readonly FAIL2BAN_ENABLED="${FAIL2BAN_ENABLED:-true}"
readonly AUTO_UPDATES_ENABLED="${AUTO_UPDATES_ENABLED:-true}"

#===============================================================================
# Funciones de Utilidad
#===============================================================================

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

#===============================================================================
# Función para verificar privilegios de sudo
#===============================================================================

check_sudo() {
    if [ "$EUID" -ne 0 ]; then
        if ! command -v sudo &> /dev/null; then
            error "No eres root y el comando 'sudo' no está disponible. En sistemas Debian/Ubuntu, puedes instalarlo con: su -c 'apt-get update && apt-get install sudo -y'"
        fi

        if ! sudo -n true 2>/dev/null; then
            error "Este script requiere privilegios de sudo. Por favor ejecuta con sudo o como root."
        fi
    fi
}

#===============================================================================
# Función para detectar la distribución de Linux
#===============================================================================

detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID

        info "Sistema detectado: $NAME $VERSION_ID"

        # Validar versiones soportadas
        case "$OS" in
            debian)
                if [ "${OS_VERSION%%.*}" -lt 11 ]; then
                    warn "Debian $OS_VERSION puede no estar completamente soportado. Se recomienda Debian 11 o superior."
                fi
                ;;
            ubuntu)
                if [ "${OS_VERSION%%.*}" -lt 20 ]; then
                    warn "Ubuntu $OS_VERSION puede no estar completamente soportado. Se recomienda Ubuntu 20.04 o superior."
                fi
                ;;
        esac
    elif [ -f /etc/arch-release ]; then
        OS="arch"
        OS_VERSION="rolling"
    else
        warn "No se pudo detectar automáticamente la distribución de Linux."
        while true; do
            read -r -p "Por favor, introduce tu distribución (debian, ubuntu, arch, centos, rhel, fedora): " MANUAL_OS
            MANUAL_OS=$(echo "$MANUAL_OS" | tr '[:upper:]' '[:lower:]')
            if [[ "$MANUAL_OS" =~ ^(debian|ubuntu|arch|centos|rhel|fedora)$ ]]; then
                OS="$MANUAL_OS"
                OS_VERSION="manual"
                break
            else
                warn "Distribución no reconocida. Intenta de nuevo."
            fi
        done
    fi

    # Normalización del nombre del OS
    case "$OS" in
        archlinux) OS="arch" ;;
        centos|rhel|fedora) OS="rhel_family" ;;
    esac
}

#===============================================================================
# Función para actualizar el sistema
#===============================================================================

update_system() {
    log "Actualizando el sistema..."
    case "$OS" in
        ubuntu|debian)
            sudo apt-get update -qq
            sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
            ;;
        arch)
            sudo pacman -Syu --noconfirm
            ;;
        rhel_family)
            if command -v dnf &> /dev/null; then
                sudo dnf update -y -q
            else
                sudo yum update -y -q
            fi
            ;;
        *)
            warn "Sistema operativo ($OS) sin soporte de actualización automática en este script."
            ;;
    esac
    log "Sistema actualizado correctamente"
}

#===============================================================================
# Función para instalar paquetes básicos
#===============================================================================

install_basic_tools() {
    log "Instalando herramientas básicas..."
    case "$OS" in
        ubuntu|debian)
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
                git curl wget rsync openssh-client openssh-server \
                apt-transport-https ca-certificates gnupg-agent \
                software-properties-common unzip zip \
                make nano vim htop tree net-tools \
                dnsutils iputils-ping traceroute \
                build-essential
            ;;
        arch)
            sudo pacman -S --noconfirm --needed \
                git curl wget rsync openssh \
                make nano vim htop tree net-tools \
                bind-tools iputils traceroute \
                base-devel
            ;;
        rhel_family)
            sudo yum install -y -q \
                git curl wget rsync openssh-clients openssh-server \
                unzip zip nano htop vim make tree net-tools \
                bind-utils iputils traceroute \
                gcc gcc-c++ make
            ;;
        *)
            warn "Sistema operativo ($OS) sin soporte de instalación básica automática."
            ;;
    esac
    log "Herramientas básicas instaladas"
}

#===============================================================================
# Hardening del Sistema
#===============================================================================

apply_kernel_hardening() {
    log "Aplicando hardening del kernel..."

    local sysctl_conf="/etc/sysctl.d/99-hardening.conf"

    sudo tee "$sysctl_conf" > /dev/null <<'EOF'
# Hardening de Red y Kernel

# Prevenir ataques de IP spoofing
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Deshabilitar IP forwarding (habilitar solo si se necesita routing)
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0

# Protección contra SYN flood
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Deshabilitar ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0

# No enviar ICMP redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Deshabilitar source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0

# Log Martian Packets (paquetes con direcciones imposibles)
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Ignorar ICMP ping requests
net.ipv4.icmp_echo_ignore_all = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Protección contra bad ICMP error messages
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Aumentar rango de puertos locales
net.ipv4.ip_local_port_range = 2000 65535

# Protección contra TCP time-wait assassination
net.ipv4.tcp_rfc1337 = 1

# Kernel hardening adicional
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1

# Protección de enlaces simbólicos y hardlinks
fs.protected_symlinks = 1
fs.protected_hardlinks = 1
fs.protected_fifos = 2
fs.protected_regular = 2

# Limitar uso de core dumps
kernel.core_uses_pid = 1
fs.suid_dumpable = 0

# Randomización de espacio de direcciones
kernel.randomize_va_space = 2
EOF

    sudo sysctl -p "$sysctl_conf" > /dev/null 2>&1 || warn "Algunas configuraciones de sysctl no pudieron aplicarse"
    log "Hardening del kernel aplicado"
}

#===============================================================================
# Configuración de límites del sistema
#===============================================================================

configure_system_limits() {
    log "Configurando límites del sistema..."

    local limits_conf="/etc/security/limits.d/99-custom.conf"

    sudo tee "$limits_conf" > /dev/null <<'EOF'
# Límites de recursos del sistema

* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768

root soft nofile 65536
root hard nofile 65536
root soft nproc 32768
root hard nproc 32768
EOF

    log "Límites del sistema configurados"
}

#===============================================================================
# Configuración avanzada de SSH
#===============================================================================

setup_ssh_hardened() {
    log "Configurando SSH con hardening de seguridad..."

    local SSH_CONFIG="/etc/ssh/sshd_config"
    local BACKUP_SSH="${SSH_CONFIG}.bak.$(date +%Y%m%d%H%M%S)"

    # Backup del archivo original
    sudo cp "$SSH_CONFIG" "$BACKUP_SSH"
    log "Backup de SSH config creado en: $BACKUP_SSH"

    # Configuración hardened de SSH
    sudo tee "$SSH_CONFIG" > /dev/null <<EOF
# Configuración SSH Hardened
# Generado por provision.sh el $(date)

# Puerto SSH
Port $SSH_PORT

# Protocolo y versiones
Protocol 2
AddressFamily any

# Autenticación
PermitRootLogin no
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

# Seguridad adicional
MaxAuthTries 3
MaxSessions 5
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2

# Forwarding
AllowTcpForwarding no
X11Forwarding no
AllowAgentForwarding no
PermitTunnel no

# Otros
UsePAM yes
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server

# Criptografía moderna
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group-exchange-sha256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512,hmac-sha2-256

# Logging
SyslogFacility AUTH
LogLevel VERBOSE
EOF

    # Validar configuración
    if sudo sshd -t; then
        sudo systemctl restart sshd 2>/dev/null || sudo systemctl restart ssh 2>/dev/null || sudo service ssh restart
        log "SSH configurado y reiniciado correctamente"
        info "Puerto SSH configurado en: $SSH_PORT"
    else
        error "Configuración SSH inválida. Se restaurará el backup."
        sudo cp "$BACKUP_SSH" "$SSH_CONFIG"
    fi
}

#===============================================================================
# Instalación y configuración de Fail2Ban
#===============================================================================

install_fail2ban() {
    if [ "$FAIL2BAN_ENABLED" != "true" ]; then
        return
    fi

    log "Instalando y configurando Fail2Ban..."

    case "$OS" in
        ubuntu|debian)
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq fail2ban
            ;;
        arch)
            sudo pacman -S --noconfirm --needed fail2ban
            ;;
        rhel_family)
            if command -v dnf &> /dev/null; then
                sudo dnf install -y -q fail2ban
            else
                sudo yum install -y -q fail2ban
            fi
            ;;
        *)
            warn "Fail2Ban no soportado para $OS"
            return
            ;;
    esac

    # Configuración de Fail2Ban
    local fail2ban_local="/etc/fail2ban/jail.local"

    sudo tee "$fail2ban_local" > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
destemail = root@localhost
sendername = Fail2Ban
action = %(action_mwl)s

[sshd]
enabled = true
port = $SSH_PORT
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

[sshd-ddos]
enabled = true
port = $SSH_PORT
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 6
bantime = 600
EOF

    sudo systemctl enable fail2ban
    sudo systemctl restart fail2ban

    log "Fail2Ban instalado y configurado"
}

#===============================================================================
# Configuración de Firewall (UFW/Firewalld/iptables)
#===============================================================================

configure_firewall() {
    log "Configurando firewall..."

    case "$OS" in
        ubuntu|debian)
            configure_ufw
            ;;
        rhel_family)
            configure_firewalld
            ;;
        arch)
            configure_ufw
            ;;
        *)
            warn "Configuración de firewall no soportada para $OS"
            ;;
    esac

    FIREWALL_ENABLED=true
}

configure_ufw() {
    if ! command -v ufw &> /dev/null; then
        sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ufw || sudo pacman -S --noconfirm --needed ufw
    fi

    # Configuración inicial
    sudo ufw --force reset

    # Políticas por defecto
    sudo ufw default deny incoming
    sudo ufw default allow outgoing

    # Reglas básicas
    sudo ufw allow "$SSH_PORT"/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'

    # Protección contra flood
    sudo ufw limit "$SSH_PORT"/tcp

    # Logging
    sudo ufw logging medium

    # Habilitar firewall
    sudo ufw --force enable

    log "UFW configurado correctamente"
    sudo ufw status verbose
}

configure_firewalld() {
    if ! command -v firewall-cmd &> /dev/null; then
        sudo yum install -y -q firewalld || sudo dnf install -y -q firewalld
    fi

    sudo systemctl enable firewalld
    sudo systemctl start firewalld

    # Configuración básica
    sudo firewall-cmd --set-default-zone=public
    sudo firewall-cmd --zone=public --add-service=ssh --permanent
    sudo firewall-cmd --zone=public --add-service=http --permanent
    sudo firewall-cmd --zone=public --add-service=https --permanent

    # Si SSH no está en puerto estándar
    if [ "$SSH_PORT" != "22" ]; then
        sudo firewall-cmd --zone=public --remove-service=ssh --permanent
        sudo firewall-cmd --zone=public --add-port="${SSH_PORT}/tcp" --permanent
    fi

    sudo firewall-cmd --reload

    log "Firewalld configurado correctamente"
    sudo firewall-cmd --list-all
}

#===============================================================================
# Configuración de Red Avanzada
#===============================================================================

configure_network() {
    log "Configurando parámetros de red..."

    # Detectar y configurar NetworkManager o systemd-networkd
    if systemctl is-active --quiet NetworkManager; then
        info "NetworkManager detectado y activo"
        configure_networkmanager
    elif systemctl is-active --quiet systemd-networkd; then
        info "systemd-networkd detectado y activo"
        configure_systemd_networkd
    else
        warn "No se detectó gestor de red conocido"
    fi

    # Configurar DNS
    configure_dns

    NETWORK_CONFIGURED=true
}

configure_networkmanager() {
    # Configuración de NetworkManager para mejor rendimiento
    local nm_conf="/etc/NetworkManager/conf.d/99-custom.conf"

    sudo mkdir -p /etc/NetworkManager/conf.d/
    sudo tee "$nm_conf" > /dev/null <<'EOF'
[main]
dns=default
systemd-resolved=false

[connection]
ipv6.method=auto
connection.mdns=no
EOF

    sudo systemctl reload NetworkManager
    log "NetworkManager configurado"
}

configure_systemd_networkd() {
    # Configuración básica de systemd-networkd
    local network_conf="/etc/systemd/network/20-wired.network"

    if [ ! -f "$network_conf" ]; then
        sudo tee "$network_conf" > /dev/null <<'EOF'
[Match]
Name=en*

[Network]
DHCP=yes
IPv6AcceptRA=yes

[DHCP]
UseDNS=yes
UseNTP=yes
EOF
        sudo systemctl restart systemd-networkd
        log "systemd-networkd configurado"
    fi
}

configure_dns() {
    log "Configurando DNS..."

    # Configurar servidores DNS seguros (Cloudflare y Google)
    local resolv_conf="/etc/resolv.conf"

    # Si systemd-resolved está activo, configurarlo
    if systemctl is-active --quiet systemd-resolved; then
        sudo mkdir -p /etc/systemd/resolved.conf.d/
        sudo tee /etc/systemd/resolved.conf.d/dns.conf > /dev/null <<'EOF'
[Resolve]
DNS=1.1.1.1 1.0.0.1 8.8.8.8 8.8.4.4
FallbackDNS=9.9.9.9
DNSSEC=allow-downgrade
DNSOverTLS=opportunistic
EOF
        sudo systemctl restart systemd-resolved
        log "systemd-resolved configurado con DNS seguros"
    else
        # Configuración manual de resolv.conf
        if [ ! -L "$resolv_conf" ]; then
            sudo tee "$resolv_conf" > /dev/null <<'EOF'
nameserver 1.1.1.1
nameserver 1.0.0.1
nameserver 8.8.8.8
nameserver 8.8.4.4
options timeout:2 attempts:3 rotate
EOF
            log "DNS configurados manualmente en resolv.conf"
        fi
    fi
}

#===============================================================================
# Configuración de Actualizaciones Automáticas
#===============================================================================

configure_auto_updates() {
    if [ "$AUTO_UPDATES_ENABLED" != "true" ]; then
        return
    fi

    log "Configurando actualizaciones automáticas de seguridad..."

    case "$OS" in
        ubuntu|debian)
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq unattended-upgrades apt-listchanges

            # Configuración de unattended-upgrades
            sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null <<'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
EOF

            sudo tee /etc/apt/apt.conf.d/20auto-upgrades > /dev/null <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

            log "Actualizaciones automáticas configuradas (Debian/Ubuntu)"
            ;;

        rhel_family)
            if command -v dnf &> /dev/null; then
                sudo dnf install -y -q dnf-automatic
                sudo sed -i 's/apply_updates = no/apply_updates = yes/' /etc/dnf/automatic.conf
                sudo systemctl enable --now dnf-automatic.timer
            else
                sudo yum install -y -q yum-cron
                sudo sed -i 's/apply_updates = no/apply_updates = yes/' /etc/yum/yum-cron.conf
                sudo systemctl enable --now yum-cron
            fi
            log "Actualizaciones automáticas configuradas (RHEL family)"
            ;;

        arch)
            warn "Arch Linux no recomienda actualizaciones automáticas. Configura manualmente si lo deseas."
            ;;
    esac
}

#===============================================================================
# Auditoría y Logging
#===============================================================================

configure_audit_logging() {
    log "Configurando auditoría y logging..."

    case "$OS" in
        ubuntu|debian)
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq auditd audispd-plugins
            ;;
        rhel_family)
            sudo yum install -y -q audit || sudo dnf install -y -q audit
            ;;
        arch)
            sudo pacman -S --noconfirm --needed audit
            ;;
    esac

    # Habilitar y arrancar auditd
    sudo systemctl enable auditd 2>/dev/null || true
    sudo systemctl start auditd 2>/dev/null || true

    log "Sistema de auditoría configurado"
}

#===============================================================================
# Instalación de LAMP Local
#===============================================================================

install_lamp_local() {
    log "Instalando stack LAMP local..."
    case "$OS" in
        ubuntu|debian)
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
                apache2 mariadb-server \
                php php-fpm libapache2-mod-php \
                php-mysql php-cli php-mbstring php-xml php-zip \
                php-curl php-gd php-intl php-bcmath php-soap

            sudo systemctl enable apache2 mariadb
            sudo systemctl start apache2 mariadb
            ;;
        arch)
            sudo pacman -S --noconfirm --needed \
                apache mariadb php php-apache php-fpm

            # Configuración básica de Apache y PHP para Arch
            if ! grep -q "LoadModule php_module" /etc/httpd/conf/httpd.conf; then
                echo "LoadModule php_module modules/libphp.so" | sudo tee -a /etc/httpd/conf/httpd.conf
                echo "AddHandler php-script .php" | sudo tee -a /etc/httpd/conf/httpd.conf
                echo "Include conf/extra/php_module.conf" | sudo tee -a /etc/httpd/conf/httpd.conf
            fi

            sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql 2>/dev/null || true
            sudo systemctl enable httpd mariadb
            sudo systemctl start httpd mariadb
            ;;
        *)
            error "La instalación de LAMP local no está soportada para $OS"
            ;;
    esac

    warn "IMPORTANTE: Ejecuta 'sudo mysql_secure_installation' para asegurar MariaDB."
    log "Stack LAMP instalado correctamente"
}

setup_project_local() {
    log "Configurando proyecto para ambiente LAMP local..."

    local source_dir=$1
    local repo_name=$(basename "$source_dir")
    local web_root="/var/www/html"

    if [ "$OS" == "arch" ]; then
        web_root="/srv/http"
    fi

    log "Copiando proyecto a $web_root/$repo_name..."
    sudo cp -R "$source_dir" "$web_root/$repo_name"

    # Asignación de propietario del servidor web
    if [[ "$OS" =~ ^(ubuntu|debian)$ ]]; then
        sudo chown -R www-data:www-data "$web_root/$repo_name"
    elif [ "$OS" == "arch" ]; then
        sudo chown -R http:http "$web_root/$repo_name"
    fi

    sudo rm -rf "$source_dir"

    info "El proyecto se ha copiado a $web_root/$repo_name"
    warn "Configura un Virtual Host de Apache para acceder correctamente."
}

#===============================================================================
# Instalación de Docker
#===============================================================================

install_docker() {
    log "Instalando Docker Engine..."

    if command -v docker &> /dev/null; then
        warn "Docker ya está instalado"
        docker --version
        return
    fi

    case "$OS" in
        ubuntu)
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ca-certificates curl gnupg
            sudo install -m 0755 -d /etc/apt/keyrings

            # Limpiar clave anterior si existe
            sudo rm -f /etc/apt/keyrings/docker.gpg

            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            sudo chmod a+r /etc/apt/keyrings/docker.gpg

            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

            sudo apt-get update -qq
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
                docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;

        debian)
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ca-certificates curl gnupg
            sudo install -m 0755 -d /etc/apt/keyrings

            sudo rm -f /etc/apt/keyrings/docker.gpg

            curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            sudo chmod a+r /etc/apt/keyrings/docker.gpg

            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

            sudo apt-get update -qq
            sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
                docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;

        arch)
            sudo pacman -S --noconfirm --needed docker docker-compose docker-buildx
            ;;

        rhel_family)
            sudo yum install -y -q yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            ;;

        *)
            error "La instalación de Docker no está soportada para $OS"
            ;;
    esac

    # Configuración de Docker con hardening
    configure_docker_daemon

    # Agregar usuario actual al grupo docker
    sudo usermod -aG docker "$USER"

    # Habilitar e iniciar Docker
    sudo systemctl enable docker
    sudo systemctl start docker

    log "Docker instalado correctamente"
    info "Cierra sesión y vuelve a entrar para usar Docker sin sudo"
}

configure_docker_daemon() {
    log "Configurando Docker daemon con hardening..."

    sudo mkdir -p /etc/docker

    sudo tee /etc/docker/daemon.json > /dev/null <<'EOF'
{
  "live-restore": true,
  "userland-proxy": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "icc": false,
  "no-new-privileges": true
}
EOF

    log "Docker daemon configurado"
}

#===============================================================================
# Configuración de SSH Keys
#===============================================================================

setup_ssh_keys() {
    log "Configurando directorio SSH..."
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh

    if [ -f ~/.ssh/authorized_keys ]; then
        chmod 600 ~/.ssh/authorized_keys
    fi
}

setup_github_ssh() {
    log "Configurando acceso SSH a GitHub..."

    if [ ! -f ~/.ssh/id_ed25519 ]; then
        info "Generando nueva clave SSH (Ed25519)..."
        ssh-keygen -t ed25519 -C "devops@$(hostname)" -N "" -f ~/.ssh/id_ed25519
    fi

    log "Por favor agrega la siguiente clave pública a tu cuenta de GitHub:"
    echo -e "${YELLOW}"
    cat ~/.ssh/id_ed25519.pub
    echo -e "${NC}"

    read -p "Presiona Enter después de haber agregado la clave a GitHub..."

    log "Probando conexión SSH con GitHub..."
    ssh -T git@github.com || true
}

#===============================================================================
# Reporte de Seguridad
#===============================================================================

security_report() {
    log "==================================================================="
    log "                    REPORTE DE SEGURIDAD                           "
    log "==================================================================="

    info "Sistema: $OS $OS_VERSION"
    info "Hostname: $(hostname)"
    info "Puerto SSH: $SSH_PORT"
    info "Firewall: $([ "$FIREWALL_ENABLED" = true ] && echo "HABILITADO" || echo "NO CONFIGURADO")"
    info "Fail2Ban: $(systemctl is-active fail2ban 2>/dev/null || echo "no instalado")"
    info "Docker: $(command -v docker &> /dev/null && echo "INSTALADO" || echo "NO INSTALADO")"

    log ""
    log "IMPORTANTE: Tareas post-instalación:"
    log "1. Ejecuta 'sudo mysql_secure_installation' si instalaste LAMP"
    log "2. Configura las claves SSH en ~/.ssh/authorized_keys"
    log "3. Cierra sesión y vuelve a entrar para aplicar cambios de grupo"
    log "4. Revisa el firewall: sudo ufw status verbose"
    log "5. Monitorea los logs: sudo journalctl -f"
    log ""
    log "==================================================================="
}

#===============================================================================
# Menú Principal
#===============================================================================

show_menu() {
    clear
    echo -e "${BLUE}"
    cat <<'EOF'
╔═══════════════════════════════════════════════════════════════╗
║         Script de Aprovisionamiento Hardened v2.0            ║
║              Debian 14 | Ubuntu 25 | Arch Linux              ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    echo "Selecciona el tipo de instalación:"
    echo ""
    echo "  1) Instalación completa con hardening"
    echo "  2) Solo hardening de seguridad"
    echo "  3) Instalar LAMP local"
    echo "  4) Instalar Docker"
    echo "  5) Configurar firewall"
    echo "  6) Configurar SSH hardened"
    echo "  7) Salir"
    echo ""
    read -r -p "Opción: " INSTALL_OPTION
}

#===============================================================================
# Función Principal
#===============================================================================

main() {
    log "Iniciando script de aprovisionamiento hardened..."

    check_sudo
    detect_os

    show_menu

    case $INSTALL_OPTION in
        1)
            log "Instalación completa con hardening..."
            update_system
            install_basic_tools
            apply_kernel_hardening
            configure_system_limits
            setup_ssh_hardened
            install_fail2ban
            configure_firewall
            configure_network
            configure_auto_updates
            configure_audit_logging
            security_report
            ;;
        2)
            log "Aplicando solo hardening de seguridad..."
            update_system
            apply_kernel_hardening
            configure_system_limits
            setup_ssh_hardened
            install_fail2ban
            configure_firewall
            configure_audit_logging
            security_report
            ;;
        3)
            log "Instalando LAMP local..."
            update_system
            install_basic_tools
            install_lamp_local
            ;;
        4)
            log "Instalando Docker..."
            update_system
            install_basic_tools
            install_docker
            ;;
        5)
            log "Configurando firewall..."
            configure_firewall
            ;;
        6)
            log "Configurando SSH hardened..."
            setup_ssh_hardened
            ;;
        7)
            info "Saliendo..."
            exit 0
            ;;
        *)
            error "Opción no válida"
            ;;
    esac

    log ""
    log "¡Aprovisionamiento completado exitosamente!"
    log "Revisa los mensajes anteriores para tareas adicionales."
}

# Ejecutar función principal
main
