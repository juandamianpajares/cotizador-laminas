# 🚀 Setup GitHub - Guía Paso a Paso

GitHub CLI ha sido instalado exitosamente. Ahora sigue estos pasos:

## 📋 Pasos a Seguir

### Paso 1: Reiniciar Terminal

**IMPORTANTE**: Cierra VS Code o tu terminal actual y ábrela de nuevo para que reconozca `gh`.

### Paso 2: Autenticarte en GitHub

Abre una **nueva terminal** (PowerShell o CMD) y ejecuta:

```bash
gh auth login
```

Te preguntará:

1. **What account do you want to log into?**
   - Selecciona: `GitHub.com` (presiona Enter)

2. **What is your preferred protocol for Git operations?**
   - Selecciona: `SSH` (usa las flechas ↑↓ y presiona Enter)

3. **Upload your SSH public key to your GitHub account?**
   - Selecciona: `Yes` (presiona Enter)
   - Te mostrará tu SSH key, presiona Enter para subirla

4. **Title for your SSH key**
   - Escribe: `PC-Juan-VSCode` (o el nombre que prefieras)
   - Presiona Enter

5. **How would you like to authenticate GitHub CLI?**
   - Selecciona: `Login with a web browser` (presiona Enter)

6. **First copy your one-time code:**
   - Copia el código que aparece (ej: `XXXX-XXXX`)
   - Presiona Enter

7. Se abrirá tu navegador:
   - Pega el código
   - Click en "Authorize GitHub CLI"
   - ¡Listo!

### Paso 3: Verificar Autenticación

En la terminal, ejecuta:

```bash
gh auth status
```

Deberías ver algo como:

```
✓ Logged in to github.com as damianpajares (...)
✓ Git operations for github.com configured to use ssh protocol.
```

### Paso 4: Crear el Repositorio en GitHub

Ahora vamos a crear el repositorio y hacer push automáticamente.

**Opción A: Repositorio Privado (Recomendado)**

```bash
gh repo create cotizador-laminas --private --source=. --remote=origin --push
```

**Opción B: Repositorio Público**

```bash
gh repo create cotizador-laminas --public --source=. --remote=origin --push
```

Esto hará:
- ✅ Crear el repositorio en GitHub
- ✅ Configurar el remote 'origin'
- ✅ Hacer push de todos tus archivos

### Paso 5: Verificar que Todo Funcionó

```bash
# Ver el repositorio en el navegador
gh repo view --web

# Ver estado de Git
git status

# Ver remote configurado
git remote -v
```

---

## 🎯 Comandos Útiles de GitHub CLI

Una vez autenticado, puedes usar:

```bash
# Ver repositorios
gh repo list

# Crear issues
gh issue create

# Ver pull requests
gh pr list

# Ver estado de autenticación
gh auth status

# Logout
gh auth logout
```

---

## ❓ Problemas Comunes

### Error: "gh: command not found"

**Solución**: Cierra y reabre la terminal. Si persiste:

```powershell
# Verificar instalación
where gh

# Si no aparece, reinstalar:
winget install --id GitHub.cli
```

### Error: "This repository already exists"

**Solución**: El repo ya existe en GitHub. Solo necesitas hacer push:

```bash
git push -u origin main
```

### Error: "failed to push"

**Solución**: Verificar que estás autenticado:

```bash
gh auth status
gh auth refresh
```

---

## 🔄 Workflow Normal Después del Setup

Una vez configurado, tu workflow normal será:

```bash
# 1. Hacer cambios
# ... editar archivos ...

# 2. Ver cambios
git status

# 3. Agregar archivos
git add .

# 4. Commit
git commit -m "descripción de cambios"

# 5. Push a GitHub
git push

# 6. Ver en el navegador
gh repo view --web
```

---

## 📝 Siguiente Paso

**Cierra esta terminal, abre una nueva, y ejecuta:**

```bash
cd c:\Users\Juan\source\repos\juandamianpajares\cotizador-laminas
gh auth login
```

¡Luego sigue las instrucciones de autenticación de arriba! 🚀
