# 🔐 Configuración de Git y GitHub - Guía Completa

Guía para resolver problemas de autenticación con GitHub desde VS Code y línea de comandos.

## 🚨 Error Común

```
fatal: Could not read from remote repository.
Please make sure you have the correct access rights
and the repository exists.
```

Este error ocurre cuando Git no puede autenticarse con GitHub.

---

## 📋 Soluciones

### Solución 1: Usar Personal Access Token (PAT) - Recomendado

GitHub ya no acepta contraseñas en línea de comandos. Debes usar un Personal Access Token.

#### Paso 1: Crear Personal Access Token

1. Ve a GitHub: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Configura:
   - **Note**: "VS Code - Cotizador Laminas"
   - **Expiration**: 90 días (o lo que prefieras)
   - **Scopes**: Marca estas opciones:
     - ✅ `repo` (acceso completo a repositorios)
     - ✅ `workflow` (para GitHub Actions)
     - ✅ `write:packages` (si usas packages)
4. Click **"Generate token"**
5. **⚠️ IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)

#### Paso 2: Configurar Credenciales en Windows

##### Opción A: Git Credential Manager (Recomendado)

```bash
# Verificar si está instalado
git credential-manager --version

# Si no está instalado, descárgalo de:
# https://github.com/git-ecosystem/git-credential-manager/releases
```

Luego, la próxima vez que hagas `git push`, se abrirá un navegador para autenticarte.

##### Opción B: Guardar Token Manualmente

```bash
# Configurar Git para usar credential helper
git config --global credential.helper wincred

# La próxima vez que hagas push, usa:
# Username: tu-usuario-github
# Password: tu-personal-access-token (NO tu contraseña)
```

#### Paso 3: Actualizar Credenciales Almacenadas

Si ya tienes credenciales viejas almacenadas:

**Windows (Credential Manager):**

1. Presiona `Win + R`
2. Escribe: `control /name Microsoft.CredentialManager`
3. Click en **"Credenciales de Windows"**
4. Busca entradas que digan `git:https://github.com`
5. Elimínalas todas
6. Cierra y vuelve a intentar `git push`

**O desde PowerShell:**

```powershell
# Listar credenciales
cmdkey /list | Select-String "github"

# Eliminar credenciales específicas
cmdkey /delete:LegacyGeneric:target=git:https://github.com
```

---

### Solución 2: SSH Keys (Alternativa más segura)

Si prefieres no usar tokens, usa SSH keys.

#### Paso 1: Generar SSH Key

```bash
# Generar nueva key
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# Presiona Enter para aceptar la ubicación por defecto
# Opcionalmente, ingresa una passphrase

# Copiar la key pública al clipboard
clip < ~/.ssh/id_ed25519.pub
```

#### Paso 2: Agregar SSH Key a GitHub

1. Ve a: https://github.com/settings/keys
2. Click **"New SSH key"**
3. **Title**: "PC Juan - VS Code"
4. **Key**: Pega la key (Ctrl+V)
5. Click **"Add SSH key"**

#### Paso 3: Probar Conexión

```bash
# Probar conexión SSH
ssh -T git@github.com

# Deberías ver:
# Hi username! You've successfully authenticated...
```

#### Paso 4: Cambiar Remote URL a SSH

```bash
# Ver URL actual
git remote -v

# Si dice https://github.com/..., cámbiala a SSH:
git remote set-url origin git@github.com:usuario/repo.git

# Verificar
git remote -v
```

---

### Solución 3: GitHub CLI (gh)

La forma más moderna y fácil.

#### Instalación

**Windows:**

```powershell
# Con winget
winget install --id GitHub.cli

# Con Chocolatey
choco install gh

# Con Scoop
scoop install gh
```

#### Configuración

```bash
# Login interactivo
gh auth login

# Selecciona:
# - GitHub.com
# - HTTPS
# - Authenticate Git with your GitHub credentials: Yes
# - Login with a web browser

# Copiar el código que aparece
# Se abrirá tu navegador para completar la autenticación
```

#### Verificar

```bash
# Verificar autenticación
gh auth status

# Probar push
git push
```

---

## 🔧 Configuración de Git (Primera vez)

Si es tu primera vez usando Git en esta PC:

```bash
# Configurar nombre
git config --global user.name "Tu Nombre"

# Configurar email
git config --global user.email "tu-email@ejemplo.com"

# Verificar configuración
git config --list

# Ver ubicación del archivo de config
git config --list --show-origin
```

---

## 📝 Comandos Útiles para Credenciales

### Ver Configuración Actual

```bash
# Ver helper de credenciales configurado
git config --global credential.helper

# Ver configuración completa
git config --list | grep credential
```

### Eliminar Credenciales Almacenadas

```bash
# Windows (desde Git Bash)
git credential-manager delete https://github.com

# O manualmente
# Control Panel → Credential Manager → Windows Credentials
# Buscar "git:https://github.com" y eliminar
```

### Probar Autenticación

```bash
# Probar fetch (no hace cambios)
git fetch origin

# Si funciona, probar push
git push origin main
```

---

## 🆘 Problemas Específicos

### Error: "Support for password authentication was removed"

**Solución**: Estás usando tu contraseña de GitHub en lugar del Personal Access Token.

```bash
# Eliminar credenciales viejas
git credential-manager delete https://github.com

# Próximo push pedirá nuevas credenciales
# Usa tu PAT como contraseña
git push
```

### Error: "Permission denied (publickey)"

**Solución**: Problema con SSH keys.

```bash
# Verificar que ssh-agent esté corriendo
eval "$(ssh-agent -s)"

# Agregar tu key
ssh-add ~/.ssh/id_ed25519

# Probar conexión
ssh -T git@github.com
```

### VS Code: "Git: Authentication failed"

**Solución en VS Code**:

1. Presiona `Ctrl + Shift + P`
2. Busca: `Git: Clone`
3. Cuando pida credenciales, usa:
   - **Username**: tu-usuario-github
   - **Password**: tu-personal-access-token

O instala la extensión oficial:
- **GitHub Pull Requests and Issues**
- Presiona `Ctrl + Shift + P`
- Busca: `GitHub: Sign in`

---

## 🔄 Workflow Recomendado

### Primera Configuración

```bash
# 1. Instalar GitHub CLI
winget install --id GitHub.cli

# 2. Autenticar
gh auth login

# 3. Configurar Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# 4. ¡Listo! Ya puedes hacer push
git push
```

### Cambiar de Cuenta

```bash
# Con GitHub CLI
gh auth logout
gh auth login

# O eliminar credenciales manualmente
# Control Panel → Credential Manager → Eliminar credenciales de GitHub
```

---

## 📱 Para WSL

Si estás usando WSL, necesitas configurar Git dentro de WSL:

```bash
# En WSL, instalar GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Autenticar
gh auth login

# Configurar Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

---

## ✅ Verificación Final

Después de configurar, verifica que todo funcione:

```bash
# 1. Ver configuración
git config --list

# 2. Ver remote
git remote -v

# 3. Probar fetch
git fetch origin

# 4. Probar push
git add .
git commit -m "Test: verificar autenticación"
git push origin main
```

Si todos los pasos funcionan, ¡estás listo! 🎉

---

## 🔗 Enlaces Útiles

- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [GitHub SSH Keys](https://github.com/settings/keys)
- [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager)
- [GitHub CLI](https://cli.github.com/)
- [Documentación oficial de Git](https://git-scm.com/doc)

---

## 💡 Recomendación Personal

**La mejor opción es usar GitHub CLI (`gh`)**: Es la forma más moderna, segura y fácil de manejar autenticación con GitHub.

```bash
# Instalar
winget install --id GitHub.cli

# Configurar
gh auth login

# ¡Y listo! No necesitas nada más.
```
