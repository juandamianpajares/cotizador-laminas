# 🔧 Fixes Aplicados - Cotizador de Láminas

Documentación de problemas encontrados y soluciones aplicadas durante el desarrollo.

---

## Fix 1: Error de Tipos en Next.js 15 - Route Params

**Fecha**: 2025-01-13

### Problema

Error durante el build de Docker:

```
Type error: Route "app/api/solicitudes/[id]/route.ts" has an invalid "GET" export:
  Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.
```

### Causa

Next.js 15 introdujo un **breaking change** en la API de rutas dinámicas. Ahora los parámetros de ruta (`params`) son retornados como una **Promise** que debe ser resuelta.

### Solución Aplicada

**Archivo afectado**: `app/api/solicitudes/[id]/route.ts`

**Antes (Next.js 13-14)**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // usar id...
}
```

**Después (Next.js 15)**:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;  // ← await necesario
  // usar id...
}
```

### Cambios Realizados

Actualizadas las 3 funciones en el archivo:
- ✅ `GET` - Obtener solicitud por ID
- ✅ `PATCH` - Actualizar solicitud
- ✅ `DELETE` - Cancelar solicitud

### Referencias

- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Dynamic Route Segments](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

---

## Fix 2: npm ci failed en Docker Build

**Fecha**: 2025-01-13

### Problema

Error durante `docker-compose build`:

```
process "/bin/sh -c npm ci --legacy-peer-deps" did not complete successfully: exit code: 1
```

### Causa

Múltiples causas posibles:
1. Incompatibilidad entre `npm ci` y Alpine Linux
2. Falta de herramientas de build para dependencias nativas
3. Timeouts de red al descargar paquetes

### Solución Aplicada

**Archivos modificados**:
- `Dockerfile`
- `Dockerfile.dev`

**Cambios**:

1. **Agregadas herramientas de build**:
```dockerfile
RUN apk add --no-cache libc6-compat openssl python3 make g++
```

2. **Cambiado de `npm ci` a `npm install` con reintentos**:
```dockerfile
RUN npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm install --legacy-peer-deps || npm install --legacy-peer-deps
```

3. **Reordenado de pasos** para optimizar caché:
- Primero copiar `package.json`
- Instalar dependencias
- Luego copiar `prisma/`
- Finalmente generar Prisma Client

### Resultado

Build exitoso en contenedores Alpine Linux con:
- ✅ Instalación de dependencias confiable
- ✅ Reintentos automáticos en caso de fallo
- ✅ Timeouts más largos para redes lentas
- ✅ Herramientas necesarias para compilar paquetes nativos

---

## Notas de Compatibilidad

### Next.js 15 Breaking Changes

Además del cambio en `params`, ten en cuenta:

1. **searchParams también es Promise** (en pages):
```typescript
// Antes
export default function Page({ searchParams }: { searchParams: { q: string } }) {
  const query = searchParams.q;
}

// Ahora
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ q: string }>
}) {
  const { q } = await searchParams;
}
```

2. **cookies() y headers() requieren await**:
```typescript
// Antes
import { cookies } from 'next/headers';
const cookieStore = cookies();

// Ahora
import { cookies } from 'next/headers';
const cookieStore = await cookies();
```

### React 19

El proyecto usa React 19 (release candidate). Principales cambios:
- Nuevos hooks: `use()`, `useOptimistic()`, `useFormStatus()`
- Server Actions mejorados
- Actions como props nativos
- `ref` como prop normal (no más `forwardRef`)

---

## Comandos Útiles para Debugging

### Verificar versiones

```bash
# En Docker
docker-compose exec app node --version
docker-compose exec app npm --version

# Ver package.json
docker-compose exec app cat package.json | grep "next"
docker-compose exec app cat package.json | grep "react"
```

### Ver logs de build

```bash
# Build con output completo
docker-compose build --no-cache --progress=plain app 2>&1 | tee build.log

# Ver solo errores
docker-compose build app 2>&1 | grep -i error
```

### Test local sin Docker

```bash
# Verificar que build funciona localmente
npm install
npm run build

# Si falla, mismo error que en Docker
# Si funciona, problema es específico de Docker
```

---

## Checklist de Build Exitoso

Cuando hagas build en Docker, verificar:

- [ ] `package.json` y `package-lock.json` existen
- [ ] No hay `node_modules/` en el directorio (debe estar en `.dockerignore`)
- [ ] Prisma schema existe en `prisma/schema.prisma`
- [ ] Variables de entorno configuradas en `.env`
- [ ] Docker daemon corriendo
- [ ] Suficiente espacio en disco
- [ ] Build completa sin errores de tipos TypeScript
- [ ] Prisma Client se genera correctamente
- [ ] Health check endpoint funciona

---

## Próximos Pasos si Encuentras Errores

1. **Leer el error completo** - No solo la primera línea
2. **Verificar versiones** - Next.js, React, Node
3. **Limpiar caché** - `docker system prune -a`
4. **Build sin caché** - `docker-compose build --no-cache`
5. **Verificar tipos** - `npx tsc --noEmit`
6. **Buscar en docs** - [nextjs.org/docs](https://nextjs.org/docs)

---

**Última actualización**: 2025-01-13
**Versión**: Sprint 7.5 + Docker
