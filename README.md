# Futbot Frontend

Aplicación web de Futbot construida con [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) y [Vite](https://vite.dev/). El proyecto utiliza Tailwind CSS para los estilos y Oxlint para el análisis del código.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) en una versión compatible con el proyecto.
- npm, incluido con Node.js.
- Git, si vas a clonar el repositorio.

Puedes comprobar tus versiones con:

```bash
node --version
npm --version
git --version
```

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/IngSoft1-futbot/futbot-frontend.git
   cd futbot-frontend
   ```

2. Cambia a la rama que deseas ejecutar, si corresponde:

   ```bash
   git checkout feature_ING-79-81_sign-up/login
   ```

3. Instala las dependencias:

   ```bash
   npm install
   ```

Actualmente el frontend no requiere variables de entorno adicionales para iniciarse localmente.

## Ejecución en desarrollo

Inicia el servidor de desarrollo con:

```bash
npm run dev
```

Vite mostrará en la terminal la URL local disponible, normalmente `http://localhost:5173`.

Para que el servidor sea accesible desde otros dispositivos de la red local, puedes ejecutar:

```bash
npm run dev -- --host
```

## Scripts disponibles

- `npm run dev`: inicia Vite en modo desarrollo con recarga en caliente.
- `npm run build`: verifica los tipos de TypeScript y genera la versión de producción en `dist/`.
- `npm run lint`: ejecuta Oxlint sobre el proyecto.
- `npm run preview`: sirve localmente la compilación generada en `dist/`. Debes ejecutar `npm run build` antes.

## Verificar el proyecto antes de subir cambios

Se recomienda ejecutar los siguientes comandos antes de crear un commit o pull request:

```bash
npm run lint
npm run build
```

## Previsualizar la versión de producción

Para probar localmente la aplicación tal como se desplegaría en producción:

```bash
npm run build
npm run preview
```

La URL de previsualización será indicada por Vite en la terminal, normalmente `http://localhost:4173`.

## Estructura principal

- `src/`: código fuente de la aplicación React.
- `public/`: archivos estáticos que se sirven directamente.
- `dist/`: archivos generados por `npm run build`.
- `package.json`: dependencias y scripts del proyecto.
- `vite.config.ts`: configuración de Vite.
- `tailwind.config.js`: configuración de Tailwind CSS.

## Tecnologías

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Oxlint
