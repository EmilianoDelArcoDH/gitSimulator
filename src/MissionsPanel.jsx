// src/MissionsPanel.jsx
import React, { useState } from "react";
import {
  validateMission1,
  validateMission2,
  validateMission3,
  validateMission4,
  validateMission5,
  validateMission6,
  validateMission7,
  validateMission8,
  validateMission9,
} from "./missionValidator";

const missions = [
  {
    id: "m1",
    title: "Misión 1 – Tu primer commit",
    description:
      'Creá el archivo "index.html", agregalo con git add y hacé un commit cuyo mensaje incluya la frase "Primer commit".',
    validator: validateMission1,
  },
  {
    id: "m2",
    title: "Misión 2 – Subir cambios al GitHub simulado",
    description:
      'Creá un repo remoto simulado con "github create ..." y luego subí tus commits con "git push origin main".',
    validator: validateMission2,
  },
  {
    id: "m3",
    title: "Misión 3 – Seguir trabajando y actualizar el remoto",
    description:
      "Agregá al menos un segundo commit en el repo local y volvé a pushear al remoto simulado. Local y remoto deben tener al menos 2 commits.",
    validator: validateMission3,
  },
  {
    id: "m4",
    title: 'Misión 4 – Rama "feature/login"',
    description:
      'Creá la rama "feature/login", cambiate a esa rama (git checkout feature/login), hacé al menos un commit y luego subí esa rama al GitHub simulado con "git push origin feature/login".',
    validator: validateMission4,
  },
  {
    id: "m5",
    title: 'Misión 5 – Página inicial con Git',
    description:
      'En el archivo "index.html", escribí una página simple que tenga un <h1> cuyo texto mencione la palabra "Git". Después podés versionarla con git add / git commit.',
    validator: validateMission5,
  },
  {
    id: "m6",
    title: 'Misión 6 – Merge de "feature/login" a "main"',
    description:
      'Desde la rama "main", integrá los cambios de "feature/login" usando "git merge feature/login". Al final, ambas ramas deben apuntar al mismo commit.',
    validator: validateMission6,
  },
  {
    id: "m7",
    title: "Misión 7 – Generar un conflicto de merge",
    description:
      "Trabajá en dos ramas y provocá un conflicto modificando la misma línea del mismo archivo.",
    validator: validateMission7,
  },
  {
    id: "m8",
    title: "Misión 8 – Resolver el conflicto de merge",
    description:
      "Abrí el editor, resolvé el conflicto eliminando las marcas y dejá la versión correcta. Luego: git add, git commit.",
    validator: validateMission8,
  },
  {
    id: "m9",
    title: "Misión 9 – Mi Primer Pull Request",
    description:
      "Creá una rama de feature, hacé commits, subí la rama al remoto y luego creá un Pull Request (github pr create <from> main). Verificá que aparezca en el visualizador.",
    validator: validateMission9,
  },



];


export function MissionsPanel({ enabledMissionIds }) {
  const [results, setResults] = useState({}); // { [id]: { ok, errors } }
  const [loadingId, setLoadingId] = useState(null);
  const visibleMissions = enabledMissionIds
    ? missions.filter((m) => enabledMissionIds.includes(m.id))
    : missions;

  // const total = visibleMissions.length;
  // const completed = visibleMissions.filter((m) => {
  //   const res = results[m.id];
  //   return res && res.ok;
  // }).length;

  const handleValidate = async (mission) => {
    setLoadingId(mission.id);
    try {
      const result = await mission.validator();
      setResults((prev) => ({
        ...prev,
        [mission.id]: result,
      }));
    } catch (e) {
      setResults((prev) => ({
        ...prev,
        [mission.id]: {
          ok: false,
          errors: [`Error interno al validar: ${e.message || String(e)}`],
        },
      }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div
      style={{
        marginTop: "16px",
        background: "#020617",
        borderRadius: "8px",
        padding: "12px",
        border: "1px solid #1f2937",
      }}
    >
      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "18px",
          color: "#e5e7eb",
        }}
      >
        Misiones de práctica
      </h2>
      <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#9ca3af" }}>
        Leé la consigna de cada misión, ejecutá los comandos en la consola y
        luego presioná “Validar misión” para comprobar si la completaste
        correctamente.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "10px",
        }}
      >
        {missions.map((m) => {
          const res = results[m.id];
          const statusColor = res
            ? res.ok
              ? "#22c55e"
              : "#ef4444"
            : "#6b7280";
          const statusText = res
            ? res.ok
              ? "Completada"
              : "Con errores"
            : "Sin validar";

          return (
            <div
              key={m.id}
              style={{
                background: "#020617",
                borderRadius: "8px",
                border: "1px solid #1f2937",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#e5e7eb",
                  }}
                >
                  {m.title}
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 6px",
                    borderRadius: "999px",
                    background: statusColor + "20",
                    color: statusColor,
                    border: `1px solid ${statusColor}60`,
                  }}
                >
                  {statusText}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                {m.description}
              </p>

              {res && !res.ok && res.errors?.length > 0 && (
                <ul
                  style={{
                    margin: "4px 0 0 0",
                    paddingLeft: "16px",
                    fontSize: "11px",
                    color: "#f97316",
                  }}
                >
                  {res.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}

              {res && res.ok && (
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "11px",
                    color: "#22c55e",
                  }}
                >
                  ¡Excelente! Esta misión está completa. 🎉
                </p>
              )}

              <div style={{ marginTop: "6px" }}>
                <button
                  onClick={() => handleValidate(m)}
                  disabled={loadingId === m.id}
                  style={{
                    background: "#3b82f6",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    fontSize: "12px",
                    color: "#f9fafb",
                    cursor: "pointer",
                    opacity: loadingId === m.id ? 0.6 : 1,
                  }}
                >
                  {loadingId === m.id ? "Validando..." : "Validar misión"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
