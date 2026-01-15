// src/commandRunner.js
import { REPO_DIR, listDir, readFile, writeFile, fileExists, fs, createFileWithTemplate } from "./gitFs";
import {
  gitInit,
  gitStatus,
  gitAdd,
  gitCommit,
  gitLog,
  gitListBranches,
  gitCreateBranch,
  gitCheckout,
  gitCheckoutCommit,
  gitMerge,
  gitRemoteAdd,
  gitRemoteRemove,
  gitRemoteList,
  gitPull,
  gitClone,
} from "./gitService";
import {
  createRemoteRepo,
  getRemoteStatus,
  pushToRemote,
  createPullRequest,
  listPullRequests,
  mergePullRequest,
  pagesPublish,
  pagesRepublish,
} from "./githubSim";
import { isCommandAllowed, getBlockedCommandMessage } from "./activities/activityRuntime";

const KNOWN_GIT_FULL = [
  "git init",
  "git status",
  "git add",
  "git commit",
  "git log",
  "git branch",
  "git checkout",
  "git merge",
  "git push",
  "git pull",
  "git remote",
  "git clone",
  "git pages",
];

function suggestFullGitCommand(raw) {
  let best = null;
  let bestDistance = Infinity;

  for (const cmd of KNOWN_GIT_FULL) {
    const d = levenshtein(raw, cmd.replace(" ", ""));
    // comparamos sin espacio: "gitinit" vs "git init"
    if (d < bestDistance) {
      bestDistance = d;
      best = cmd;
    }
  }

  if (bestDistance > 3) return null;
  return best;
}

// --- Sugerencias para comandos "github" ---

const KNOWN_GITHUB_SUBCOMMANDS = ["create", "status", "pr"];

function suggestGithubSubcommand(word) {
  let best = null;
  let bestDistance = Infinity;

  for (const candidate of KNOWN_GITHUB_SUBCOMMANDS) {
    const d = levenshtein(word, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }

  if (bestDistance > 3) return null;
  return best;
}

const KNOWN_GITHUB_FULL = ["github create", "github status", "github pr"];

function suggestFullGithubCommand(raw) {
  let best = null;
  let bestDistance = Infinity;

  for (const cmd of KNOWN_GITHUB_FULL) {
    const d = levenshtein(raw, cmd.replace(" ", "")); // "githubcreate" vs "github create"
    if (d < bestDistance) {
      bestDistance = d;
      best = cmd;
    }
  }

  if (bestDistance > 3) return null;
  return best;
}




// Lista de subcomandos git que soporta el simulador
const KNOWN_GIT_SUBCOMMANDS = [
  "init",
  "status",
  "add",
  "commit",
  "log",
  "branch",
  "checkout",
  "merge",
  "push",
  "pull",
  "remote",
  "clone",
  "pages",
  "conflicts",
];

// Distancia de Levenshtein (para ver qué tan parecido es un comando mal escrito)
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // borrar
        dp[i][j - 1] + 1,      // insertar
        dp[i - 1][j - 1] + cost // reemplazar
      );
    }
  }

  return dp[m][n];
}

function suggestGitSubcommand(word) {
  let best = null;
  let bestDistance = Infinity;

  for (const candidate of KNOWN_GIT_SUBCOMMANDS) {
    const d = levenshtein(word, candidate);
    if (d < bestDistance) {
      bestDistance = d;
      best = candidate;
    }
  }

  // Si está demasiado lejos, no sugerimos nada
  if (bestDistance > 3) return null;
  return best;
}

// --- Hints educativos por comando git ---

const shownHints = new Set();

function withHint(key, baseMessage, hintLines) {
  // baseMessage puede venir undefined/null, lo normalizamos
  const base = baseMessage ?? "";

  // Si ya mostramos el tip para este comando, devolvemos solo el mensaje base
  if (shownHints.has(key)) return base;

  shownHints.add(key);

  const hintBody = hintLines.join("\n");
  if (!hintBody) return base;

  // Insertamos marcadores especiales para que la Terminal pueda separarlo
  if (!base) {
    return `[[HINT_START]]\n${hintBody}\n[[HINT_END]]`;
  }

  return `${base}\n[[HINT_START]]\n${hintBody}\n[[HINT_END]]`;
}

// Normaliza input a command key para verificar permisos
function getCommandKey(input) {
  const trimmed = input.trim();
  const parts = trimmed.split(/\s+/);
  
  // Shell commands
  if (["help", "ls", "cat", "touch", "pwd"].includes(parts[0])) {
    return parts[0];
  }
  
  // Git commands: "git <subcommand>"
  if (parts[0] === "git" && parts[1]) {
    return `git ${parts[1]}`;
  }
  
  // GitHub commands: "github <subcommand>"
  if (parts[0] === "github" && parts[1]) {
    // Para "github pr" mantenemos solo "github pr"
    return parts[1] === "pr" ? "github pr" : `github ${parts[1]}`;
  }
  
  return null; // comando desconocido, no gateamos
}





async function ensureRepoReady() {
  try {
    await fs.promises.readFile(`${REPO_DIR}/.git/HEAD`, { encoding: "utf8" });
    return true;
  } catch (e) {
    return false;
  }
}

function repoMissingMessage() {
  return [
    "❗ No encontré la referencia HEAD.",
    "Parece que tu repositorio aún no está inicializado.",
    "",
    "💡 Tip: empezá con:",
    "    git init",
  ].join("\n");
}

function parseGitCommand(cmd) {
  const parts = cmd.trim().split(/\s+/);
  const sub = parts[1];

  if (!sub) return { type: "error", message: "Uso: git <comando>" };

  switch (sub) {
    case "init":
      return { type: "git-init" };

    case "status":
      return { type: "git-status" };

    case "add":
      if (!parts[2]) {
        return { type: "error", message: "Uso: git add <archivo>" };
      }
      if (parts[2] === ".") {
        return { type: "git-add-dot" };
      }
      return { type: "git-add", file: parts[2] };

    case "commit": {
      const msgIndex = parts.indexOf("-m");
      if (msgIndex === -1 || !parts[msgIndex + 1]) {
        return {
          type: "error",
          message: 'Uso: git commit -m "mensaje"',
        };
      }
      const raw = parts.slice(msgIndex + 1).join(" ");
      const match = raw.match(/^"(.*)"$/);
      const message = match ? match[1] : raw;
      return { type: "git-commit", message };
    }

    case "log": {
      // git log [rama]
      const ref = parts[2] || "main";
      return { type: "git-log", ref };
    }

    case "branch": {
      // git branch   → lista ramas
      // git branch nombre  → crea rama
      const name = parts[2];
      if (!name) return { type: "git-branch-list" };
      return { type: "git-branch-create", name };
    }

    case "checkout": {
      const name = parts[2];
      if (!name) {
        return {
          type: "error",
          message: "Uso: git checkout <nombre-rama-o-hash>",
        };
      }
      // Si parece un hash (40 chars hex o 7+), usar checkout commit
      const isHash = /^[0-9a-f]{7,40}$/i.test(name);
      return { 
        type: isHash ? "git-checkout-commit" : "git-checkout", 
        name 
      };
    }
    case "merge": {
      const name = parts[2];
      if (!name) {
        return {
          type: "error",
          message: 'Uso: git merge <nombre-rama>',
        };
      }
      return { type: "git-merge", branch: name };
    }

    case "conflicts": {
      // git conflicts  → lista archivos con marcas de conflicto
      return { type: "git-conflicts" };
    }


    case "push": {
      const remote = parts[2] || "origin";
      const branch = parts[3] || "main";
      return { type: "git-push", remote, branch };
    }

    case "pull": {
      const remote = parts[2] || "origin";
      const branch = parts[3] || "main";
      return { type: "git-pull", remote, branch };
    }

    case "clone": {
      const url = parts[2];
      if (!url) {
        return {
          type: "error",
          message: "Uso: git clone <url>",
        };
      }
      return { type: "git-clone", url };
    }

    case "remote": {
      const action = parts[2];
      
      if (!action || action === "-v") {
        return { type: "git-remote-list" };
      }

      if (action === "add") {
        const name = parts[3];
        const url = parts[4];
        if (!name || !url) {
          return {
            type: "error",
            message: "Uso: git remote add <nombre> <url>",
          };
        }
        return { type: "git-remote-add", name, url };
      }

      if (action === "remove" || action === "rm") {
        const name = parts[3];
        if (!name) {
          return {
            type: "error",
            message: "Uso: git remote remove <nombre>",
          };
        }
        return { type: "git-remote-remove", name };
      }

      return {
        type: "error",
        message: "Uso: git remote [-v | add | remove]",
      };
    }

    case "pages": {
      const action = parts[2];
      
      if (action === "publish") {
        return { type: "git-pages-publish" };
      }

      if (action === "republish") {
        return { type: "git-pages-republish" };
      }

      return {
        type: "error",
        message: "Uso: git pages [publish | republish]",
      };
    }

    default: {
      const suggestion = suggestGitSubcommand(sub);
      if (suggestion) {
        return {
          type: "error",
          message: [
            `Comando git desconocido: "${sub}".`,
            "",
            `💡 Quizás quisiste escribir:`,
            `    git ${suggestion}`,
          ].join("\n"),
        };
      }

      return {
        type: "error",
        message: `Comando git desconocido: "${sub}". Usá "git help" o "help" para ver los comandos disponibles.`,
      };
    }
  }
}

function parseGithubCommand(cmd) {
  const parts = cmd.trim().split(/\s+/);
  const sub = parts[1];

  if (!sub) {
    return {
      type: "error",
      message:
        'Uso: github <comando>\nEj: github create mi-repo, github status',
    };
  }

  switch (sub) {
    case "create": {
      const name = parts[2];
      if (!name) {
        return {
          type: "error",
          message: "Uso: github create <nombre-repo>",
        };
      }
      return { type: "gh-create", name };
    }

    case "status":
      return { type: "gh-status" };

    case "pr": {
      const action = parts[2];

      if (!action) {
        return {
          type: "error",
          message:
            'Uso: github pr <comando>\nEj: github pr create <from> <to>, github pr list, github pr merge <id>',
        };
      }

      // github pr create <from> [to] [-t "Título opcional"]
      if (action === "create") {
        const from = parts[3];
        const to = parts[4] || "main";

        if (!from) {
          return {
            type: "error",
            message: "Uso: github pr create <rama-origen> [rama-destino]",
          };
        }

        const titleIndex = parts.indexOf("-t");
        let title = "";
        if (titleIndex !== -1 && parts[titleIndex + 1]) {
          title = parts.slice(titleIndex + 1).join(" ");
        }

        return {
          type: "gh-pr-create",
          from,
          to,
          title,
        };
      }

      // github pr list
      if (action === "list") {
        return { type: "gh-pr-list" };
      }

      // github pr merge <id>
      if (action === "merge") {
        const idStr = parts[3];
        if (!idStr) {
          return {
            type: "error",
            message: "Uso: github pr merge <id>",
          };
        }
        const id = parseInt(idStr, 10);
        if (Number.isNaN(id)) {
          return {
            type: "error",
            message: "El id del PR debe ser un número.",
          };
        }
        return { type: "gh-pr-merge", id };
      }

      return {
        type: "error",
        message:
          'Subcomando no soportado para "github pr". Usá: create, list, merge.',
      };
    }

    default: {
      const suggestion = suggestGithubSubcommand(sub);
      if (suggestion) {
        return {
          type: "error",
          message: [
            `Comando GitHub simulado desconocido: "github ${sub}".`,
            "",
            "💡 Quizás quisiste escribir:",
            `    github ${suggestion} ...`,
          ].join("\n"),
        };
      }

      return {
        type: "error",
        message: `Comando GitHub simulado no soportado: github ${sub}`,
      };
    }
  }
}


async function listConflictFiles() {
  const entries = await listDir(REPO_DIR);
  const visibles = entries.filter((name) => name !== ".git");

  const conflicts = [];

  for (const file of visibles) {
    const path = `${REPO_DIR}/${file}`;
    const content = await readFile(path);
    if (
      content.includes("<<<<<<<") &&
      content.includes("=======") &&
      content.includes(">>>>>>>")
    ) {
      conflicts.push(file);
    }
  }

  return conflicts;
}


export async function runCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Command gating: verificar si el comando está permitido en la actividad actual
  const commandKey = getCommandKey(trimmed);
  if (commandKey && !isCommandAllowed(commandKey)) {
    return getBlockedCommandMessage(commandKey);
  }

  // Caso especial: cosas tipo "gitinit", "gitstatus", "gitcommit"
  if (trimmed.startsWith("git") && !trimmed.startsWith("git ")) {
    const suggestion = suggestFullGitCommand(trimmed);
    if (suggestion) {
      return [
        `Comando no reconocido: "${trimmed}"`,
        "",
        "💡 Quizás quisiste escribir:",
        `    ${suggestion}`,
      ].join("\n");
    }
  }

  // github sin espacio → githubcreate, githubstatus, etc.
  if (trimmed.startsWith("github") && !trimmed.startsWith("github ")) {
    const suggestion = suggestFullGithubCommand(trimmed);
    if (suggestion) {
      return [
        `Comando no reconocido: "${trimmed}"`,
        "",
        "💡 Quizás quisiste escribir:",
        `    ${suggestion} ...`,
      ].join("\n");
    }
  }



  if (trimmed === "help") {
    return [
      "Comandos disponibles:",
      "  help                        - Muestra esta ayuda",
      "  ls                          - Lista archivos en /repo",
      "  cat <archivo>               - Muestra el contenido de un archivo",
      "  touch <archivo>             - Crea un archivo vacío",
      "  pwd                         - Muestra el directorio actual",
      "",
      "Git local:",
      "  git init                    - Inicializa un repo Git",
      "  git status                  - Estado del repo",
      "  git add <archivo>           - Añade archivo al index",
      "  git commit -m \"mensaje\"     - Crea un commit",
      "  git log [rama]              - Muestra el historial de commits",
      "  git branch                  - Lista ramas",
      "  git branch <nombre>         - Crea una rama nueva",
      "  git checkout <rama|hash>    - Cambia a rama o commit",
      "  git merge <rama>            - Integra la rama indicada en la rama actual",
      "  git conflicts               - Lista archivos con marcas de conflicto de merge",
      "",
      "Git remoto:",
      "  git remote [-v]             - Lista remotos configurados",
      "  git remote add <nom> <url>  - Configura un remoto",
      "  git remote remove <nombre>  - Elimina un remoto",
      "  git push origin <rama>      - Sube commits al remoto",
      "  git pull origin <rama>      - Trae commits del remoto",
      "  git clone <url>             - Clona repositorio remoto",
      "",
      "GitHub Pages (simulado):",
      "  git pages publish           - Publica sitio en Pages",
      "  git pages republish         - Actualiza sitio publicado",
      "",
      "GitHub simulado:",
      "  github create <nombre>          - Crea un repo remoto simulado",
      "  github status                   - Muestra estado del remoto simulado",
      "  github pr create <from> [to]    - Crea un Pull Request simulado",
      "  github pr list                  - Lista Pull Requests simulados",
      "  github pr merge <id>            - Marca un PR simulado como MERGED",
    ].join("\n");
  }


  // Shell
  if (trimmed === "pwd") {
    return REPO_DIR;
  }

  if (trimmed === "ls") {
    const entries = await listDir(REPO_DIR);
    return entries.join("  ");
  }

  if (trimmed.startsWith("cat ")) {
    const file = trimmed.replace("cat ", "").trim();
    const path = `${REPO_DIR}/${file}`;
    const exists = await fileExists(path);
    if (!exists) return `cat: no se encontró el archivo: ${file}`;
    return await readFile(path);
  }

  if (trimmed.startsWith("touch ")) {
    const file = trimmed.replace("touch ", "").trim();

    await createFileWithTemplate(file);

    return file.toLowerCase().endsWith(".html")
      ? `Archivo HTML creado con plantilla básica: ${file}`
      : `Archivo creado: ${file}`;
  }


// GitHub simulado
if (trimmed.startsWith("github ")) {
  const parsed = parseGithubCommand(trimmed);
  if (parsed.type === "error") return parsed.message;

  switch (parsed.type) {
    case "gh-create": {
      const remote = createRemoteRepo(parsed.name);
      return [
        `Repositorio remoto simulado creado: ${remote.name}`,
        `URL simulada: ${remote.url}`,
        "",
        "Ahora podés simular un push con:",
        "  git push origin main",
      ].join("\n");
    }

    case "gh-status":
      return getRemoteStatus();

    case "gh-pr-create": {
      try {
        const pr = createPullRequest(parsed.from, parsed.to, parsed.title);
        return [
          `Pull Request simulado creado (#${pr.id}):`,
          `  De: ${pr.fromBranch}`,
          `  A:  ${pr.toBranch}`,
          `  Título: ${pr.title}`,
          "",
          "En Git real, alguien revisaría el código antes de aprobar el merge.",
        ].join("\n");
      } catch (e) {
        return e.message || String(e);
      }
    }

    case "gh-pr-list": {
      const prs = listPullRequests();
      if (!prs.length) {
        return "No hay Pull Requests simulados todavía.";
      }

      const lines = ["Pull Requests simulados:"];
      prs.forEach((pr) => {
        lines.push(
          `#${pr.id} [${pr.status}] ${pr.fromBranch} → ${pr.toBranch} — ${pr.title}`
        );
      });
      return lines.join("\n");
    }

    case "gh-pr-merge": {
      try {
        const pr = mergePullRequest(parsed.id);
        return [
          `PR #${pr.id} marcado como MERGED.`,
          `Rama origen: ${pr.fromBranch}`,
          `Rama destino: ${pr.toBranch}`,
          "",
          "Recordá que en Git real esto crea un commit de merge (o fast-forward) en la rama destino.",
        ].join("\n");
      } catch (e) {
        return e.message || String(e);
      }
    }

    default:
      return "Error interno al procesar comando GitHub simulado.";
  }
}



// Git
if (trimmed.startsWith("git ")) {
  const parsed = parseGitCommand(trimmed);
  if (parsed.type === "error") return parsed.message;
  if (parsed.type !== "git-init") {
    const ok = await ensureRepoReady();
    if (!ok) return repoMissingMessage();
  }

  switch (parsed.type) {
    case "git-init": {
      const msg = await gitInit();
      return withHint("git-init", msg, [
        "git init crea la carpeta .git y empieza a seguir el historial en este proyecto.",
        "Usalo una sola vez al crear un repositorio nuevo.",
      ]);
    }

    case "git-status": {
      const msg = await gitStatus();
      return withHint("git-status", msg, [
        "git status te muestra qué archivos cambiaron y si están en el staging (listos para commit) o no.",
        "Es útil para revisar antes de hacer git add o git commit.",
      ]);
    }

    case "git-add": {
      const msg = await gitAdd(parsed.file);
      return withHint("git-add", msg, [
        "git add prepara archivos para el próximo commit (staging).",
        "Usalo para elegir qué cambios querés incluir en un commit.",
      ]);
    }

    case "git-add-dot": {
      const entries = await listDir(REPO_DIR);
      const visibles = entries.filter((name) => name !== ".git");

      const msg = [
        'En este simulador no usamos "git add .".',
        "",
        "💡 Tip: agregá archivos de a uno, por ejemplo:",
        "    git add index.html",
      ];

      if (visibles.length) {
        msg.push("", "Archivos disponibles en /repo:");
        visibles.forEach((f) => msg.push(`  - ${f}`));
      }

      return withHint("git-add", msg.join("\n"), [
        "git add prepara archivos para el próximo commit (staging).",
        "En la vida real podrías usar git add . para todo, pero acá practicamos archivo por archivo 😉.",
      ]);
    }

    case "git-commit": {
      const msg = await gitCommit(parsed.message);
      return withHint("git-commit", msg, [
        "git commit guarda un snapshot del estado de los archivos que agregaste con git add.",
        "Elegí mensajes claros, así recordás qué cambio hiciste en cada commit.",
      ]);
    }

    case "git-log": {
      const msg = await gitLog(parsed.ref);
      return withHint("git-log", msg, [
        "git log te muestra el historial de commits.",
        "Podés usar git log nombre-rama para ver otra rama específica.",
      ]);
    }

    case "git-branch-list": {
      const msg = await gitListBranches();
      return withHint("git-branch", msg, [
        "git branch lista las ramas locales del proyecto.",
        "Crear ramas nuevas te permite probar cosas sin romper la rama principal.",
      ]);
    }

    case "git-branch-create": {
      const msg = await gitCreateBranch(parsed.name);
      return withHint("git-branch", msg, [
        "git branch <nombre> crea una rama nueva apuntando al commit actual.",
        "Es buena práctica crear una rama por feature o tarea.",
      ]);
    }

    case "git-checkout": {
      const msg = await gitCheckout(parsed.name);
      return withHint("git-checkout", msg, [
        "git checkout cambia la rama activa.",
        "Usalo para moverte entre versiones de tu proyecto (por ejemplo: main, feature/login, etc.).",
      ]);
    }

    case "git-checkout-commit": {
      const msg = await gitCheckoutCommit(parsed.name);
      return withHint("git-checkout", msg, [
        "git checkout <hash> te mueve a un commit específico (detached HEAD).",
        "Esto es útil para ver cómo era el proyecto en ese momento.",
        "Para volver a una rama: git checkout main",
      ]);
    }

    case "git-merge": {
      const msg = await gitMerge(parsed.branch);
      return withHint("git-merge", msg, [
        "git merge integra los commits de otra rama en la rama actual.",
        "Si hay conflictos, tendrás que resolverlos en los archivos y luego hacer git add + git commit.",
      ]);
    }

    case "git-conflicts": {
      const files = await listConflictFiles();
      if (!files.length) {
        return withHint("git-conflicts",
          "No se detectan archivos con marcas de conflicto (<<<<<<< ======= >>>>>>>) en /repo.",
          [
            "Los conflictos aparecen cuando dos ramas modifican la misma parte de un archivo.",
            "Si hiciste git merge y no ves conflictos, puede que el merge haya sido automático."
          ]
        );
      }

      const base = [
        "Archivos con conflictos detectados (buscando <<<<<<<, =======, >>>>>>>):",
        ...files.map((f) => `  - ${f}`),
        "",
        "Pasos típicos para resolver un conflicto:",
        "  1. Abrí el archivo en el editor.",
        "  2. Elegí qué versión dejar (o combiná ambas) y borrá las marcas.",
        "  3. Guardá el archivo.",
        "  4. Ejecutá: git add <archivo>",
        '  5. Luego: git commit -m "Resuelvo conflicto de merge"',
      ].join("\n");

      return withHint("git-conflicts", base, [
        "git conflicts es una ayuda para localizar rápidamente qué archivos tienen conflictos de merge.",
        "Combinado con el editor, te guía para practicar la resolución de conflictos paso a paso."
      ]);
    }


    case "git-push": {
      const msg = await pushToRemote(parsed.remote, parsed.branch);
      return withHint("git-push", msg, [
        "git push envía tus commits a un remoto (por ejemplo, GitHub).",
        "En este simulador usamos un GitHub falso para practicar sin romper repos reales.",
      ]);
    }

    case "git-pull": {
      const msg = await gitPull(parsed.remote, parsed.branch);
      return withHint("git-pull", msg, [
        "git pull trae commits del remoto y los integra en tu rama actual.",
        "Es equivalente a: git fetch + git merge",
      ]);
    }

    case "git-clone": {
      const msg = await gitClone(parsed.url);
      return withHint("git-clone", msg, [
        "git clone copia un repositorio remoto a tu máquina local.",
        "Es la forma más común de empezar a trabajar en un proyecto existente.",
      ]);
    }

    case "git-remote-add": {
      const msg = await gitRemoteAdd(parsed.name, parsed.url);
      return withHint("git-remote", msg, [
        "git remote add configura un repositorio remoto.",
        "Después podés hacer push/pull con ese remoto.",
      ]);
    }

    case "git-remote-remove": {
      const msg = await gitRemoteRemove(parsed.name);
      return withHint("git-remote", msg, [
        "git remote remove elimina la configuración de un remoto.",
      ]);
    }

    case "git-remote-list": {
      const msg = await gitRemoteList();
      return withHint("git-remote", msg, [
        "git remote -v lista los remotos configurados.",
        "Cada remoto tiene una URL de fetch y push.",
      ]);
    }

    case "git-pages-publish": {
      const msg = pagesPublish();
      return withHint("git-pages", msg, [
        "GitHub Pages te permite publicar sitios web estáticos desde tu repositorio.",
        "Es gratis y muy usado para portfolios, documentación y proyectos pequeños.",
      ]);
    }

    case "git-pages-republish": {
      const msg = pagesRepublish();
      return withHint("git-pages", msg, [
        "Republicar actualiza tu sitio con los últimos cambios.",
        "En GitHub real, esto se hace automáticamente en cada push.",
      ]);
    }


    default:
      return "Error interno al procesar comando git.";
  }
}

// Fallback global: cualquier cosa que no sea git/github/shell
return `Comando no reconocido: ${input}\nEscribí "help" para ver comandos.`;
}
