import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ACTIVITY_REGISTRY } from "../activities/registry";

export default function HomePage() {
  const activities = Object.values(ACTIVITY_REGISTRY);
  const [expandedSolutions, setExpandedSolutions] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const toggleSolution = (activityId) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [activityId]: !prev[activityId],
    }));
  };

  const copyCommands = async (activityId, commands) => {
    try {
      await navigator.clipboard.writeText(commands.join("\n"));
      setCopiedId(activityId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  return (
    <div
      className="home-page"
      style={{
        background: "var(--vsc-bg)",
        color: "var(--vsc-text)",
        padding: "48px 24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 12 }}>
          Git & GitHub Trainer
        </h1>
        <p style={{ fontSize: 15, opacity: 0.8, marginBottom: 48 }}>
          Simulador interactivo para aprender Git y GitHub en un ambiente VS Code
        </p>

        <div style={{ display: "grid", gap: 20 }}>
          {activities.map((activity) => {
            const isExpanded = expandedSolutions[activity.id];
            const isCopied = copiedId === activity.id;

            return (
              <div
                key={activity.id}
                style={{
                  padding: 24,
                  background: "var(--vsc-sidebar-bg)",
                  border: "1px solid var(--vsc-border)",
                  borderRadius: 8,
                  color: "var(--vsc-text)",
                  transition: "all 0.15s cubic-bezier(0.2, 0, 0, 1)",
                }}
              >
                <Link
                  to={`/act/${activity.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        opacity: 0.6,
                        fontWeight: 600,
                      }}
                    >
                      {activity.id}
                    </div>
                    <div style={{ flex: 1, height: 1, background: "var(--vsc-border)" }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                    {activity.title}
                  </h3>
                  <p style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6, marginBottom: 12 }}>
                    {activity.description}
                  </p>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    {activity.missions.length} misiones disponibles
                  </div>
                </Link>

                {/* Comandos solución */}
                {activity.solutionCommands && activity.solutionCommands.length > 0 && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--vsc-border)" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSolution(activity.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--vsc-accent)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "4px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span style={{ fontSize: 10 }}>{isExpanded ? "▼" : "▶"}</span>
                      {isExpanded ? "Ocultar comandos solución" : "Ver comandos solución"}
                    </button>

                    {isExpanded && (
                      <div
                        className="solution-panel"
                        style={{
                          marginTop: 12,
                          background: "var(--vsc-panel-bg)",
                          border: "1px solid var(--vsc-border)",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            borderBottom: "1px solid var(--vsc-border)",
                            background: "rgba(0,0,0,0.2)",
                          }}
                        >
                          <span style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Comandos de ejemplo
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCommands(activity.id, activity.solutionCommands);
                            }}
                            style={{
                              background: isCopied ? "var(--vsc-accent)" : "rgba(255,255,255,0.08)",
                              border: "1px solid var(--vsc-border)",
                              borderRadius: 3,
                              color: "var(--vsc-text)",
                              cursor: "pointer",
                              fontSize: 11,
                              padding: "4px 10px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isCopied ? "✓ Copiado" : "Copiar"}
                          </button>
                        </div>
                        <pre
                          style={{
                            margin: 0,
                            padding: "12px",
                            fontFamily: "var(--vsc-mono)",
                            fontSize: 12,
                            lineHeight: 1.6,
                            color: "var(--vsc-text)",
                            overflowX: "auto",
                          }}
                        >
                          {activity.solutionCommands.map((cmd, idx) => (
                            <div key={idx} style={{ opacity: cmd.startsWith("#") ? 0.6 : 1, fontStyle: cmd.startsWith("#") ? "italic" : "normal" }}>
                              {cmd}
                            </div>
                          ))}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
