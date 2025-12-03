// src/commandRunner.js
import { REPO_DIR, listDir, readFile, writeFile, fileExists, fs } from "./gitFs";
import {
  gitInit,
  gitStatus,
  gitAdd,
  gitCommit,
  gitLog,
  gitListBranches,
  gitCreateBranch,
  gitCheckout,
  gitMerge,
} from "./gitService";
import {
  createRemoteRepo,
  getRemoteStatus,
  pushToRemote,
  getRemoteData,
} from "./githubSim";

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
          message: "Uso: git checkout <nombre-rama>",
        };
      }
      return { type: "git-checkout", name };
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


    case "push": {
      const remote = parts[2] || "origin";
      const branch = parts[3] || "main";
      return { type: "git-push", remote, branch };
    }

    default:
      return {
        type: "error",
        message: `Comando git no soportado todavía: git ${sub}`,
      };
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

    default:
      return {
        type: "error",
        message: `Comando GitHub simulado no soportado: github ${sub}`,
      };
  }
}

export async function runCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return "";

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
      "  git add <archivo>           - Añade archivo al index (no se soporta git add .)",
      "  git commit -m \"mensaje\"     - Crea un commit",
      "  git log [rama]              - Muestra el historial de commits",
      "  git push origin main        - Push simulado al GitHub falso",
      "  git branch                  - Lista ramas",
      "  git branch <nombre>         - Crea una rama nueva",
      "  git checkout <nombre>       - Cambia a la rama indicada",
      "  git merge <rama>            - Integra la rama indicada en la rama actual",

      "",
      "GitHub simulado:",
      "  github create <nombre>      - Crea un repo remoto simulado",
      "  github status               - Muestra estado del remoto simulado",
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
    const path = `${REPO_DIR}/${file}`;
    await writeFile(path, "");
    return `Archivo creado: ${file}`;
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
      case "git-init":
        return await gitInit();
      case "git-status":
        return await gitStatus();
      case "git-add":
        return await gitAdd(parsed.file);
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

        return msg.join("\n");
      }

      case "git-commit":
        return await gitCommit(parsed.message);
      case "git-log":
        return await gitLog(parsed.ref);
      case "git-branch-list":
        return await gitListBranches();
      case "git-branch-create":
        return await gitCreateBranch(parsed.name);
      case "git-checkout":
        return await gitCheckout(parsed.name);
      case "git-merge":
        return await gitMerge(parsed.branch);
      case "git-push":
        return await pushToRemote(parsed.remote, parsed.branch);
      default:
        return "Error interno al procesar comando git.";
    }
  }


  return `Comando no reconocido: ${input}\nEscribí "help" para ver comandos.`;
}
