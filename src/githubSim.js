// src/githubSim.js
import * as git from "isomorphic-git";
import { fs, REPO_DIR } from "./gitFs";

const REMOTE_KEY = "git-trainer-remote";

let memoryRemote = null;

function loadRemote() {
  try {
    const raw = window.localStorage.getItem(REMOTE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return memoryRemote;
  }
}

function saveRemote(remote) {
  try {
    window.localStorage.setItem(REMOTE_KEY, JSON.stringify(remote));
  } catch {
    memoryRemote = remote;
  }
}

export function resetRemote() {
  try {
    window.localStorage.removeItem(REMOTE_KEY);
  } catch {
    memoryRemote = null;
  }
}

export function createRemoteRepo(name) {
  const remote = {
    name,
    defaultBranch: "main",
    url: `https://github-sim.local/${name}.git`,
    lastPushedBranch: null,
    commits: [],
  };
  saveRemote(remote);
  return remote;
}

export function getRemoteStatus() {
  const remote = loadRemote();
  if (!remote) {
    return "No hay repositorio remoto simulado.\nUsá: github create <nombre-repo>";
  }

  let out = `GitHub simulado:\n`;
  out += `  Nombre del repo: ${remote.name}\n`;
  out += `  URL simulada:    ${remote.url}\n`;
  out += `  Rama por defecto: ${remote.defaultBranch}\n`;
  if (!remote.commits.length) {
    out += `  (sin commits pushados todavía)\n`;
  } else {
    out += `  Última rama pusheada: ${remote.lastPushedBranch}\n`;
    out += `  Commits remotos:\n`;
    for (const c of remote.commits) {
      out += `    ${c.oid.slice(0, 7)}  ${c.message}\n`;
    }
  }
  return out;
}

// 🔹 Nuevo: para el panel React
export function getRemoteData() {
  return loadRemote();
}

export async function pushToRemote(remoteName, branchName = "main") {
  if (remoteName !== "origin") {
    return `Por ahora solo se soporta: git push origin <rama>`;
  }

  const remote = loadRemote();
  if (!remote) {
    return [
      "No hay repo remoto simulado.",
      "Primero creá uno con:",
      "  github create <nombre-repo>",
    ].join("\n");
  }

  let log;
  try {
    log = await git.log({
      fs,
      dir: REPO_DIR,
      ref: branchName,
    });
  } catch (e) {
    return `No se pudo leer la rama '${branchName}'. ¿Creaste commits?`;
  }

  const commits = log.map((entry) => ({
    oid: entry.oid,
    message: entry.commit.message,
    author: entry.commit.author.name,
    timestamp: entry.commit.author.timestamp,
  }));

    const updated = {
    ...remote,
    lastPushedBranch: branchName,
    commits,
  };


  saveRemote(updated);

  return [
    `Push simulado a ${remote.url}`,
    `Rama: ${branchName}`,
    `Commits enviados: ${commits.length}`,
  ].join("\n");
}
