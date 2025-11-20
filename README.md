# Finz App - Gestión Inteligente de Finanzas Personales

<div align="center">

![Finz App Banner](img/Finz-Dashboard.png)

 La app moderna y completa para tomar control total de tus finanzas personales 

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

[Demo](#-capturas-de-pantalla) • [Características](#-características) • [Instalación](#-instalación) • [Roadmap](#-roadmap-y-mejoras-futuras)

</div>

---

## Descripción

**Finz App** es una aplicación web diseñada para gestionar tus finanzas personales de manera eficiente y visual. Con una interfaz limpia y moderna, podrás registrar todas tus transacciones, crear presupuestos, establecer metas de ahorro y visualizar el estado de tus finanzas en tiempo real.

---

## Características

### Gestión de Cuentas
- Crea múltiples cuentas bancarias, tarjetas, inversiones y más
- Visualiza balances en tiempo real
- Soporte para diferentes tipos de cuentas (bancarias, ahorros, crypto, efectivo)

### Transacciones
- Registra ingresos, gastos y transferencias entre cuentas
- Categoriza automáticamente tus transacciones
- Filtrado avanzado por fecha, categoría, monto y cuenta
- Búsqueda rápida por descripción

### Dashboard Interactivo
- Resumen visual de tu situación financiera
- Gráficas de ingresos vs gastos
- Distribución de gastos por categoría
- Balance total y ahorro mensual

### Presupuestos
- Crea presupuestos por categoría
- Alertas visuales al superar límites (80%, 100%)
- Seguimiento de progreso en tiempo real

### Metas de Ahorro
- Define objetivos financieros
- Monitorea tu progreso hacia cada meta
- Visualiza tiempo restante y contribuciones

### Reportes Detallados
- Reportes semanales, mensuales y anuales
- Análisis por categorías
- Exportación de datos (JSON, CSV)
- Evolución de patrimonio

### ⚙️ Configuración Completa
- Gestión de perfil de usuario
- Categorías personalizables
- Exportación de todos tus datos
- Eliminación segura de cuenta

---

## 📸 Capturas de Pantalla

<div align="center">

### Dashboard Principal
![Dashboard](img/Finz-Dashboard.png)

### Gestión de Cuentas
![Cuentas](img/Finz-Cuentas.png)

### Transacciones
![Transacciones](img/Finz-Transacciones.png)

### Categorías
![Categorías](img/Finz-Categorias.png)

### Presupuestos
![Presupuestos](img/Finz-Presupuestos.png)

### Metas de Ahorro
![Ahorro](img/Finz-Ahorro.png)

### Reportes
![Reportes](img/Finz-Reportes.png)

### Configuración
![Configuración](img/Finz-Config.png)

</div>

##  Requisitos Previos

- **Node.js 18+** ([Descargar](https://nodejs.org/))
- **PostgreSQL** (local o [Vercel Postgres](https://vercel.com/storage/postgres))
- **npm** o **pnpm**

### Cuentas necesarias (gratuitas):
- **[Google Cloud Console](https://console.cloud.google.com/)** - Para OAuth con Google
- **[Resend](https://resend.com/)** - Para envío de emails (Magic Links)
- **[Vercel](https://vercel.com/)** (opcional) - Para deployment

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/finz-app.git
cd finz-app
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/finz_app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="tu_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu_client_secret"

# Email Provider (Resend)
RESEND_API_KEY="re_tu_api_key"
EMAIL_FROM="noreply@tu-dominio.com"
```

#### Cómo obtener las credenciales:

**Google OAuth:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita la API de Google+
4. Crea credenciales OAuth 2.0
5. Añade `http://localhost:3000/api/auth/callback/google` como URI de redirección

**Resend:**
1. Regístrate en [Resend.com](https://resend.com/)
2. Verifica tu dominio o usa el dominio de prueba
3. Genera una API Key

**NextAuth Secret:**
```bash
openssl rand -base64 32
```

### 4. Configurar base de datos

```bash
# Generar cliente de Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma db push

# (Opcional) Cargar datos de ejemplo
npx prisma db seed
```

### 5. Ejecutar el proyecto

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Build
npm run build        # Construir para producción
npm start            # Iniciar servidor de producción

# Base de datos
npx prisma studio    # Interfaz visual de la BD
npx prisma generate  # Generar cliente de Prisma
npx prisma migrate   # Crear migración
npx prisma db push   # Actualizar BD sin migración

# Linting
npm run lint         # Ejecutar ESLint
```

---

## Estructura del Proyecto

```
finz-app/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas de autenticación
│   ├── (dashboard)/         # Rutas protegidas
│   └── api/                 # API Routes
├── components/
│   ├── features/            # Componentes por módulo
│   ├── layouts/             # Layouts (Sidebar, Header)
│   └── ui/                  # Componentes UI base (shadcn)
├── lib/
│   ├── auth/                # Configuración NextAuth
│   ├── db/                  # Cliente Prisma
│   ├── services/            # Lógica de negocio
│   ├── utils/               # Utilidades
│   └── validations/         # Schemas de Zod
├── prisma/
│   ├── schema.prisma        # Schema de la base de datos
│   └── seed.ts              # Datos iniciales
└── public/                  # Archivos estáticos
```


##  Mejoras Futuras

> **Nota:** Esta es una versión inicial (v1.0) de Finz App. 

### Próximas Funcionalidades (v1.1 - v1.3)

- [ ] **Importar/Exportar CSV** - Importa transacciones desde otros apps
- [ ] **Reportes PDF** - Genera reportes descargables en PDF
- [ ] **Compartir Cuentas** - Gestión colaborativa de finanzas
- [ ] **Análisis Predictivo** - Proyecciones de gastos e ingresos
- [ ] **Recordatorios** - Alertas de pagos pendientes
- [ ] **Dashboard Personalizable** - Arrastra y reorganiza widgets
- [ ] **Gestión de Deudas** - Trackea préstamos y deudas

- [ ] **App Móvil** (React Native / Expo)
- [ ] **Integración Bancaria** (Open Banking APIs)
- [ ] **AI Financial Assistant** - Asistente con IA para análisis y consejos
- [ ] **Inversiones** - Seguimiento de portafolio de inversiones
- [ ] **API Pública** - Permite integraciones de terceros

### 🤝 ¿Quieres Contribuir?

¡Las contribuciones son bienvenidas! Si tienes ideas para nuevas funcionalidades o encuentras bugs, por favor:

1. Abre un [Issue](https://github.com/AntonioMotaDev/finz-app/issues)
2. Fork el proyecto
3. Crea una rama (`git checkout -b feature/NuevaFuncionalidad`)
4. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
5. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
6. Abre un Pull Request

---

## Licencia

Este proyecto está bajo la licencia **MIT**. Puedes usarlo libremente para proyectos personales o comerciales.

---

## Contacto y Soporte

- **Issues**: [GitHub Issues](https://github.com/AntonioMotaDev/finz-app/issues)
- **Email**: dev.antoniomota@gmail.com

---

 **Desarrollado por Antonio Mota** 


<div align="center">


[⬆ Volver arriba](#-finz-app---gestión-inteligente-de-finanzas-personales)

</div>

