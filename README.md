# Proyecto Ferremas


## Por que Ferremas?


  
## Comenzando

Esta guía le proporcionará los pasos necesarios para configurar y familiarizarse con el proyecto Astro en su máquina de desarrollo local.

### Clone el Repositorio
Una vez creado el repositorio, puede clonarlo en su máquina local utilizando los siguientes comandos:

```bash
git clone https://github.com/[YOUR_USERNAME]/[YOUR_REPO_NAME].git
cd [YOUR_REPO_NAME]
```

### Instalación

```bash
npm install
```

Este comando command instalara todas las dependencias necesarias definidas en el archivo `package.json`.

### Comandos

con las dependecias instalas , puedes levantar la pagina a tu localhost

* `npm run dev`: Inicia un servidor de desarrollo local con la recarga en caliente habilitada.
* `npm run preview`: Sirve su salida de compilación localmente para obtener una vista previa antes de la implementación.
* `npm run build`: Agrupa su sitio en archivos estáticos para la producción.



src/
├── assets/               
│   ├── scripts/          # JS scripts
│   └── styles/           # CSS styles
├── components/           # Reusable components
│   ├── Meta.astro        # Meta component for SEO
│   ├── sections/         # Components for various sections of the website
│   ├── ThemeIcon.astro   # Component for toggling light/dark themes
│   └── ui/               # UI components categorized by functionality
├── content/              # Markdown files for blog posts, insights, products, and site configuration
│   ├── blog/
│   ├── docs/           
│   ├── insights/         
│   └── products/         
├── data_files/           # Strings stored as JSON files
├── images/               # Static image assets for use across the website
├── layouts/              # Components defining layout templates
│   └── MainLayout.astro  # The main wrapping layout for all pages
├── pages/                # Astro files representing individual pages and website sections
│   ├── 404.astro         # Custom 404 page
│   ├── blog/   
│   ├── fr/               # Localized content
│   ├── contact.astro     
│   ├── index.astro       # The landing/home page
│   ├── insights/         
│   ├── products/         
│   ├── robots.txt.ts     # Dynamically generates robots.txt
│   └── services.astro
├── utils/                # Shared utility functions and helpers
└── content.config.ts     # Contains content collections configuration options
```

