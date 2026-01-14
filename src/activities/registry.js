// src/activities/registry.js
// Registro centralizado de actividades accesible por ID (para routing).

export const ACTIVITY_REGISTRY = {
  "act-1": {
    id: "act-1",
    title: "Actividad 1 – Git local (básico)",
    description:
      "Trabajá con Git local: inicializar el repo, agregar archivos y hacer commits. No se usa GitHub simulado ni editor.",
    showEditor: false,
    allowedCommands: [
      "help", "ls", "cat", "touch", "pwd",
      "git init", "git status", "git add", "git commit", "git log",
      "git branch", "git checkout"
    ],
    missions: [
      {
        id: "m1",
        title: "Misión 1 – Tu primer commit",
        description:
          'Creá el archivo "index.html", agregalo con git add y hacé un commit cuyo mensaje incluya la frase "Primer commit".',
        validatorKey: "m1",
      },
      {
        id: "m3",
        title: "Misión 3 – Seguir trabajando y actualizar el remoto",
        description:
          "Agregá al menos un segundo commit en el repo local y volvé a pushear al remoto simulado. Local y remoto deben tener al menos 2 commits.",
        validatorKey: "m3",
      },
    ],
    seedFiles: [
      { path: "README.md", content: "Proyecto Git Trainer\n" },
    ],
  },
  "act-2": {
    id: "act-2",
    title: "Actividad 2 – Git + GitHub simulado",
    description:
      "Practicá Git local y GitHub simulado: commits, push al remoto y ramas.",
    showEditor: false,
    allowedCommands: [
      "help", "ls", "cat", "touch", "pwd",
      "git init", "git status", "git add", "git commit", "git log",
      "git branch", "git checkout", "git merge", "git push",
      "github create", "github status"
    ],
    missions: [
      {
        id: "m1",
        title: "Misión 1 – Tu primer commit",
        description:
          'Creá el archivo "index.html", agregalo con git add y hacé un commit cuyo mensaje incluya la frase "Primer commit".',
        validatorKey: "m1",
      },
      {
        id: "m2",
        title: "Misión 2 – Subir cambios al GitHub simulado",
        description:
          'Creá un repo remoto simulado con "github create ..." y luego subí tus commits con "git push origin main".',
        validatorKey: "m2",
      },
      {
        id: "m3",
        title: "Misión 3 – Seguir trabajando y actualizar el remoto",
        description:
          "Agregá al menos un segundo commit en el repo local y volvé a pushear al remoto simulado. Local y remoto deben tener al menos 2 commits.",
        validatorKey: "m3",
      },
      {
        id: "m4",
        title: 'Misión 4 – Rama "feature/login"',
        description:
          'Creá la rama "feature/login", cambiate a esa rama (git checkout feature/login), hacé al menos un commit y luego subí esa rama al GitHub simulado con "git push origin feature/login".',
        validatorKey: "m4",
      },
      {
        id: "m6",
        title: 'Misión 6 – Merge de "feature/login" a "main"',
        description:
          'Desde la rama "main", integrá los cambios de "feature/login" usando "git merge feature/login". Al final, ambas ramas deben apuntar al mismo commit.',
        validatorKey: "m6",
      },
    ],
    seedFiles: [
      { path: "README.md", content: "Repo con remoto simulado\n" },
    ],
  },
  "act-3": {
    id: "act-3",
    title: "Actividad 3 – Git + GitHub + HTML",
    description:
      'Además de Git y GitHub simulado, trabajá con el editor para crear "index.html" y validar su contenido.',
    showEditor: true,
    allowedCommands: [
      "help", "ls", "cat", "touch", "pwd",
      "git init", "git status", "git add", "git commit", "git log",
      "git branch", "git checkout", "git merge", "git push", "git conflicts",
      "github create", "github status", "github pr"
    ],
    missions: [
      {
        id: "m1",
        title: "Misión 1 – Tu primer commit",
        description:
          'Creá el archivo "index.html", agregalo con git add y hacé un commit cuyo mensaje incluya la frase "Primer commit".',
        validatorKey: "m1",
      },
      {
        id: "m2",
        title: "Misión 2 – Subir cambios al GitHub simulado",
        description:
          'Creá un repo remoto simulado con "github create ..." y luego subí tus commits con "git push origin main".',
        validatorKey: "m2",
      },
      {
        id: "m3",
        title: "Misión 3 – Seguir trabajando y actualizar el remoto",
        description:
          "Agregá al menos un segundo commit en el repo local y volvé a pushear al remoto simulado. Local y remoto deben tener al menos 2 commits.",
        validatorKey: "m3",
      },
      {
        id: "m4",
        title: 'Misión 4 – Rama "feature/login"',
        description:
          'Creá la rama "feature/login", cambiate a esa rama (git checkout feature/login), hacé al menos un commit y luego subí esa rama al GitHub simulado con "git push origin feature/login".',
        validatorKey: "m4",
      },
      {
        id: "m5",
        title: 'Misión 5 – Página inicial con Git',
        description:
          'En el archivo "index.html", escribí una página simple que tenga un <h1> cuyo texto mencione la palabra "Git". Después podés versionarla con git add / git commit.',
        validatorKey: "m5",
      },
      {
        id: "m6",
        title: 'Misión 6 – Merge de "feature/login" a "main"',
        description:
          'Desde la rama "main", integrá los cambios de "feature/login" usando "git merge feature/login". Al final, ambas ramas deben apuntar al mismo commit.',
        validatorKey: "m6",
      },
      {
        id: "m7",
        title: "Misión 7 – Generar un conflicto de merge",
        description:
          "Trabajá en dos ramas y provocá un conflicto modificando la misma línea del mismo archivo.",
        validatorKey: "m7",
      },
      {
        id: "m8",
        title: "Misión 8 – Resolver el conflicto de merge",
        description:
          "Abrí el editor, resolvé el conflicto eliminando las marcas y dejá la versión correcta. Luego: git add, git commit.",
        validatorKey: "m8",
      },
      {
        id: "m9",
        title: "Misión 9 – Mi Primer Pull Request",
        description:
          "Creá una rama de feature, hacé commits, subí la rama al remoto y luego creá un Pull Request (github pr create <from> main). Verificá que aparezca en el visualizador.",
        validatorKey: "m9",
      },
    ],
    seedFiles: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Actividad 3</title>
</head>
<body>
  <h1>Practicando Git</h1>
  <p>Completá las misiones usando el terminal.</p>
</body>
</html>
`,
      },
      { path: "README.md", content: "Actividad 3 con HTML inicial\n" },
    ],
  },
};

export function listActivities() {
  return Object.values(ACTIVITY_REGISTRY);
}

export function getActivityById(id) {
  return ACTIVITY_REGISTRY[id] || null;
}
