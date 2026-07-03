# TrayectAI 🎓

**Tu copiloto académico inteligente.**

TrayectAI ayuda a estudiantes universitarios a visualizar su progreso académico, entender correlatividades, simular escenarios de cursada, proyectar su fecha de egreso y gamificar su avance.

> Construido con Next.js 16 · React 19 · Prisma 6 · PostgreSQL (Supabase)

---

## ✨ Funcionalidades

| Funcionalidad | Descripción | 
|--------------|-------------|
| 📚 **Plan de estudios** | Visualización del plan por año/cuatrimestre con estados de cada materia, búsqueda y filtros |
| 🔗 **Correlatividades** | Motor en tiempo real que resuelve materias habilitadas/bloqueadas con DAG interactivo |
| 🧪 **Modo simulación** | "¿Qué pasa si apruebo X?" — descubre qué materias se desbloquean al aprobar una o varias |
| 🎓 **Proyección de egreso** | Estimación de fecha de graduación según tu ritmo actual |
| 🤖 **Copiloto académico** | Chat conversacional que responde preguntas sobre tu carrera (materias, correlativas, progreso, recomendaciones) con sugerencias rápidas, persistencia de historial y panel flotante |
| 📅 **Calendario académico** | Exámenes agrupados por mes, con colores por tipo |
| 🔔 **Alertas** | Ventanas de inscripción a exámenes con alertas urgency/danger/info |
| 📊 **Dashboard** | Progreso, estadísticas, recomendación inteligente de materias con secciones colapsables |
| 🎮 **Gamificación** | Índice de salud académica, racha de constancia, 11 logros con panel visual |
| 🎨 **Temas** | 3 temas (navy oscuro, claro, dark IDE) + modo automático que sigue la preferencia del sistema |
| 🔐 **Autenticación JWT** | Login/registro con JWT httpOnly cookies |
| ♿ **Accesibilidad** | Roles ARIA, `aria-live`, `focus-visible`, etiquetas descriptivas, touch targets ≥44px |

---

## 🚀 Stack

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 16 (Turbopack) |
| **UI** | React 19, Tailwind CSS v4, CSS Variables |
| **Estado** | TanStack React Query |
| **Base de datos** | PostgreSQL (Supabase) |
| **ORM** | Prisma 6 |
| **Autenticación** | JWT (jose) + bcryptjs |

---

## 🛠️ Comandos

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build de producción + typecheck
npm run lint         # ESLint
npm start            # Iniciar servidor de producción

npx prisma db seed   # Sembrar datos (UNMDP, 8 facultades, 38 carreras)
npx prisma migrate dev --name <nombre>   # Crear + aplicar migración
npx prisma studio    # Abrir Prisma Studio
```

---

## 🗺️ Rutas

| Ruta | Página |
|------|--------|
| `/` | Dashboard — progreso, stats, recomendaciones, gamificación |
| `/plan` | Plan de estudios con DAG interactivo, planner por cuatrimestre, simulación y copiloto |
| `/calendario` | Calendario académico de exámenes |
| `/alertas` | Alertas de inscripción a exámenes |
| `/login` | Inicio de sesión |
| `/onboarding` | Registro en 4 pasos (universidad → facultad → carrera → cuenta) |
| `/settings` | Selector de temas |

---

## 🗄️ Base de datos

10 modelos: `University`, `Faculty`, `Career`, `Subject`, `CareerSubject`, `Prerequisite`, `User`, `UserAcademicProfile`, `UserSubjectProgress`, `Exam`.

**Seed incluido** con Universidad Nacional de Mar del Plata, 8 facultades y 38 carreras (incluyendo Lic. Administración, Ing. Informática e Ing. Química Plan 2024).

El **motor de correlatividades** vive en `lib/prerequisite-engine.ts` y resuelve en tiempo real los estados de cada materia según las correlativas aprobadas/regulares/cursadas.

---

## 🔐 Autenticación

- JWT custom (no NextAuth.js)
- Cookies httpOnly (`trayectai_session`) con expiración de 7 días
- API: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`

---

## 🎨 Temas

Sistema de temas basado en CSS Variables (no Tailwind `dark:`).  
3 temas fijos + modo **Automático** que sigue `prefers-color-scheme`.  
La configuración se persiste en `localStorage`.

---

## 🤖 Copiloto académico

Chat conversacional con detección de intenciones que responde:

- "¿Qué puedo cursar?" — materias habilitadas agrupadas por año
- "Recomendame" — priorizadas por impacto (cuánto desbloquean)
- "¿Qué necesito para [materia]?" — correlativas con estado
- "¿Qué pasa si apruebo [materia]?" — simulación de desbloqueo
- "¿Cómo voy?" / "¿Cuándo me egreso?" — progreso y proyección
- "¿Por qué está bloqueada?" — materias trabadas con lo que falta

Panel flotante tipo FAB (🤖) accesible desde Dashboard y Plan de estudios.  
Persistencia de historial en `localStorage`. Todo el engine es rule-based y preparado para migrar a LLM.

---

## 🎮 Gamificación

- **Índice de salud académica** (0–100): mide eficiencia, constancia, regularidad y cobertura
- **Racha**: sesiones diarias consecutivas
- **11 logros**: desde "Primer paso" hasta "Maratón académico" y "Fénix"
- Panel visual con medidor SVG, streak card y grilla expandible de badges

---

## 🧪 Tests

No hay framework de tests configurado actualmente.

---

## 📁 Estructura del proyecto

```
app/                  # Páginas (client components) y API routes
  api/                #   Rutas API (auth, careers, exams, alerts, progress)
  page.tsx            #   Dashboard
  plan/page.tsx       #   Plan de estudios (DAG, planner, simulación)
  calendario/page.tsx #   Calendario
  alertas/page.tsx    #   Alertas
  login/page.tsx      #   Login
  onboarding/page.tsx #   Registro
  settings/page.tsx   #   Configuración
components/ui/        # Componentes compartidos
  academic-chat.tsx   #   Copiloto + panel flotante (FAB)
  achievements-panel.tsx # Panel de gamificación
  navbar.tsx          #   Navegación
  semester-planner.tsx  # Planificador por cuatrimestre
  subject-graph.tsx   #   DAG interactivo de correlativas
lib/                  # Lógica de negocio y utilidades
  auth.ts             #   JWT + bcrypt
  auth-context.tsx    #   Contexto de autenticación
  chat-engine.ts      #   Motor del copiloto (pattern-matching)
  gamification.ts     #   Salud académica, racha, logros
  prerequisite-engine.ts  # Motor de correlatividades
  themes.ts           #   Sistema de temas
prisma/               # Schema, migraciones y seeds
```

---

## 🧑‍💻 Desarrollo

1. Clonar el repo
2. `npm install`
3. Configurar `DATABASE_URL` en `.env` (PostgreSQL / Supabase)
4. `npx prisma db seed` para cargar datos de ejemplo
5. `npm run dev`

---

## 📄 Licencia

MIT
