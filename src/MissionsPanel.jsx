// src/MissionsPanel.jsx
import React, { useMemo, useState } from "react";

export function MissionsPanel({ missions = [], theme, runValidator }) {
  const [results, setResults] = useState({}); // { [id]: { ok, errors } }
  const [loadingId, setLoadingId] = useState(null);
  const visibleMissions = useMemo(() => missions, [missions]);

  // const total = visibleMissions.length;
  // const completed = visibleMissions.filter((m) => {
  //   const res = results[m.id];
  //   return res && res.ok;
  // }).length;

  const handleValidate = async (mission) => {
    setLoadingId(mission.id);
    try {
      const result = runValidator
        ? await runValidator(mission.validatorKey)
        : { ok: false, errors: ["No hay validador disponible para esta misión."] };
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
        background: theme === "dark" ? "#0C0C0C" : "#ffffff",
        border: `1px solid ${theme === "dark" ? "#1f2937" : "#cbd5e1"}`,
        color: theme === "dark" ? "#e5e7eb" : "#1f2937",
        marginTop: "16px",
        borderRadius: "8px",
        padding: "12px",
      }}
    >
      <h2
        style={{
          margin: "0 0 8px 0",
          fontSize: "18px",
          color: theme === "dark" ? "#e5e7eb" : "#1f2937",
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
        {visibleMissions.map((m) => {
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

export default MissionsPanel;
