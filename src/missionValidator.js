// src/missionValidator.js
import * as git from "isomorphic-git";
import {
  fs,
  REPO_DIR,
  listDir,
  readFile,
  fileExists,
} from "./gitFs";
import { getRemoteData } from "./githubSim";
import { gitCurrentBranchName } from "./gitService";

// Helper: log de HEAD (sin importar si la rama es main/master)
async function getHeadLog() {
  return git.log({ fs, dir: REPO_DIR, ref: "HEAD" });
}

/**
 * MISIÓN 1
 * Objetivo:
 *  - Tener un archivo index.html en /repo
 *  - Haber hecho al menos un commit
 *  - El último commit debe contener "primer commit" en el mensaje
 */
export async function validateMission1() {
  const errors = [];

  // 1) ¿Existe index.html?
  let files = [];
  try {
    files = await listDir(REPO_DIR);
  } catch (e) {
    // ignoramos, se maneja abajo
  }
  if (!files.includes("index.html")) {
    errors.push('No creaste el archivo "index.html" en el repositorio.');
  }

  // 2) ¿Hay commits?
  let log = [];
  try {
    log = await getHeadLog();
  } catch (e) {
    // si falla, log se queda vacío
  }

  if (log.length === 0) {
    errors.push("Todavía no hiciste ningún commit.");
    return { ok: false, errors };
  }

  // 3) ¿El último commit menciona "primer commit"?
  const last = log[0];
  const msg = last.commit.message.toLowerCase();
  if (!msg.includes("primer commit")) {
    errors.push(
      'El mensaje del último commit debe contener la frase "Primer commit".'
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * MISIÓN 2
 * Objetivo:
 *  - Haber creado un GitHub simulado (github create ...)
 *  - Haber pusheado al remoto al menos un commit (git push origin main)
 */
export async function validateMission2() {
  const errors = [];
  const remote = getRemoteData();

  if (!remote) {
    errors.push(
      "Todavía no creaste un repositorio remoto simulado. Usá: github create <nombre>."
    );
    return { ok: false, errors };
  }

  if (!remote.commits || remote.commits.length === 0) {
    errors.push(
      "Todavía no hiciste push al remoto. Probá con: git push origin main."
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * MISIÓN 3
 * Objetivo:
 *  - Haber hecho al menos 2 commits en HEAD
 *  - Haber pusheado esos commits al GitHub simulado
 */
export async function validateMission3() {
  const errors = [];

  // 1) ¿Hay al menos 2 commits locales?
  let log = [];
  try {
    log = await getHeadLog();
  } catch (e) {
    // si falla, log se queda vacío
  }

  if (log.length < 2) {
    errors.push(
      "Necesitás al menos 2 commits en el repo local. Hacé un segundo commit."
    );
  }

  // 2) ¿El remoto tiene al menos 2 commits?
  const remote = getRemoteData();
  if (!remote || !remote.commits || remote.commits.length < 2) {
    errors.push(
      "Tu GitHub simulado no tiene aún 2 commits. Asegurate de hacer git push origin main después del segundo commit."
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * MISIÓN 4
 * Objetivo:
 *  - Crear una rama llamada "feature/login"
 *  - Hacer al menos un commit en esa rama
 *  - Hacer push al remoto simulado de esa rama: git push origin feature/login
 */
export async function validateMission4() {
  const errors = [];

  // 1) ¿Existe la rama feature/login?
  let branches = [];
  try {
    branches = await git.listBranches({ fs, dir: REPO_DIR });
  } catch (e) {}

  if (!branches.includes("feature/login")) {
    errors.push('No creaste la rama "feature/login". Usá: git branch feature/login');
  }

  // 2) ¿Tiene commits propios?
  let logFeature = [];
  try {
    logFeature = await git.log({
      fs,
      dir: REPO_DIR,
      ref: "feature/login",
    });
  } catch (e) {}

  if (logFeature.length === 0) {
    errors.push(
      'La rama "feature/login" no tiene commits. Cambiá a esa rama (git checkout feature/login) y hacé al menos un commit.'
    );
  }

  // 3) ¿Se hizo push de esa rama al remoto?
  const remote = getRemoteData();
  if (!remote) {
    errors.push(
      "Todavía no creaste un remoto simulado. Usá: github create <nombre>."
    );
  } else {
    if (remote.lastPushedBranch !== "feature/login") {
      errors.push(
        'No hiciste push de la rama "feature/login". Probá con: git push origin feature/login.'
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
/**
 * MISIÓN 5
 * Objetivo:
 *  - Tener un archivo index.html
 *  - Que no esté vacío
 *  - Que tenga un <h1>...</h1> cuyo contenido incluya la palabra "git"
 */
export async function validateMission5() {
  const errors = [];
  const path = `${REPO_DIR}/index.html`;

  // 1) ¿Existe index.html?
  const exists = await fileExists(path);
  if (!exists) {
    errors.push('No encontré el archivo "index.html" en /repo.');
    return { ok: false, errors };
  }

  // 2) ¿Tiene contenido?
  let html;
  try {
    html = await readFile(path);
  } catch (e) {
    errors.push(
      `No pude leer index.html: ${e.message || String(e)}`
    );
    return { ok: false, errors };
  }

  const trimmed = html.trim();
  if (trimmed.length === 0) {
    errors.push("El archivo index.html está vacío. Escribí algo de contenido.");
  }

  // 3) ¿Tiene un <h1>...?</h1>
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
  const h1Match = trimmed.match(h1Regex);

  if (!h1Match) {
    errors.push(
      'No encontré ningún encabezado <h1> en index.html. Agregá un <h1> con un título principal.'
    );
  } else {
    const h1Text = h1Match[1].toLowerCase();
    if (!h1Text.includes("git")) {
      errors.push(
        'El texto dentro de <h1> debería mencionar la palabra "Git" (por ejemplo: "Mi primera página con Git").'
      );
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * MISIÓN 6
 * Objetivo:
 *  - Tener ramas "main" y "feature/login"
 *  - Que la rama "main" ya incorpore los cambios de "feature/login"
 *    (es decir, que ambas apunten al mismo commit final).
 *
 * Flujo sugerido para el alumno:
 *  1. git checkout main
 *  2. git merge feature/login
 */
export async function validateMission6() {
  const errors = [];

  let mainOid = null;
  let featureOid = null;

  // 1) ¿Existe rama main?
  try {
    mainOid = await git.resolveRef({
      fs,
      dir: REPO_DIR,
      ref: "refs/heads/main",
    });
  } catch {
    errors.push(
      'No encontré la rama "main". Asegurate de haber inicializado el repo con rama main y hecho al menos un commit.'
    );
  }

  // 2) ¿Existe rama feature/login?
  try {
    featureOid = await git.resolveRef({
      fs,
      dir: REPO_DIR,
      ref: "refs/heads/feature/login",
    });
  } catch {
    errors.push(
      'No encontré la rama "feature/login". Creala con: git branch feature/login y trabajá en ella.'
    );
  }

  if (!mainOid || !featureOid) {
    return { ok: false, errors };
  }

  // 3) ¿main contiene los cambios de feature/login?
  if (mainOid !== featureOid) {
    errors.push(
      'La rama "main" todavía no contiene los cambios de "feature/login". ' +
        'Probá desde main con: git merge feature/login'
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * MISIÓN 7 — Generar un conflicto de merge simple
 *
 * Objetivo:
 *  - Que exista la rama "conflicto"
 *  - Que al hacer merge desde main, se haya producido un conflicto
 */
export async function validateMission7() {
  const errors = [];

  // Detectar si hubo conflicto
  const conflictFiles = await git.statusMatrix({ fs, dir: REPO_DIR })
    .then(matrix =>
      matrix.filter(([path, head, workdir, stage]) => stage === 0 && workdir === 2)
        .map(([path]) => path)
    )
    .catch(() => []);

  if (conflictFiles.length === 0) {
    errors.push(
      "No se detectaron archivos en conflicto. Necesitás producir un conflicto modificando la misma línea en dos ramas distintas."
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * MISIÓN 8 — Resolver el conflicto y completar el merge
 */
export async function validateMission8() {
  const errors = [];

  // Detectar si aún hay marcadores <<<<<<< >>>>>>>
  let conflictMarkers = false;

  const files = await listDir(REPO_DIR);
  const visible = files.filter((f) => f !== ".git");

  for (const file of visible) {
    const full = `${REPO_DIR}/${file}`;
    const content = await readFile(full);
    if (
      content.includes("<<<<<<<") ||
      content.includes("=======") ||
      content.includes(">>>>>>>")
    ) {
      conflictMarkers = true;
      break;
    }
  }

  if (conflictMarkers) {
    errors.push(
      "Todavía quedan marcadores de conflicto (<<<<<<< ======= >>>>>>>). Tenés que resolverlos y luego hacer commit."
    );
  }

  // Detectar si se completó el merge
  let mergeDone = true;
  try {
    const log = await git.log({ fs, dir: REPO_DIR, ref: "HEAD" });
    mergeDone = log[0].commit.message.toLowerCase().includes("resuelvo");
  } catch {
    mergeDone = false;
  }

  if (!mergeDone) {
    errors.push(
      'Después de resolver el conflicto tenés que hacer: git add <archivo> y luego: git commit -m "Resuelvo conflicto"'
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

