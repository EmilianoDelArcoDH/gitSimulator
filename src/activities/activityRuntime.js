// src/activities/activityRuntime.js
// Runtime state para saber qué actividad está activa.
// Usado por commandRunner para validar comandos permitidos.

import { getActivityById } from "./registry";

let currentActivityId = null;

export function setCurrentActivityId(id) {
  currentActivityId = id;
}

export function getCurrentActivityId() {
  return currentActivityId;
}

export function getCurrentActivityConfig() {
  if (!currentActivityId) return null;
  return getActivityById(currentActivityId);
}

export function isCommandAllowed(commandKey) {
  const config = getCurrentActivityConfig();
  if (!config) return true; // sin actividad cargada, permitir todo
  if (!config.allowedCommands) return true; // sin lista, permitir todo
  return config.allowedCommands.includes(commandKey);
}

export function getBlockedCommandMessage(commandKey) {
  const config = getCurrentActivityConfig();
  const activityTitle = config?.title || "esta actividad";
  
  return [
    `⛔ El comando "${commandKey}" no está habilitado en ${activityTitle}.`,
    "",
    "Esta actividad se enfoca en comandos más básicos.",
    "💡 Tip: revisá la lista de misiones para ver qué comandos necesitás practicar aquí,",
    "o cambiá a una actividad más avanzada que incluya este comando.",
    "",
    "Usá 'help' para ver los comandos disponibles en el simulador.",
  ].join("\n");
}
