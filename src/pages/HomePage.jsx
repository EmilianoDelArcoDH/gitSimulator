import React from "react";
import { Link } from "react-router-dom";
import { ACTIVITY_REGISTRY } from "../activities/registry";

export default function HomePage() {
  const activities = Object.values(ACTIVITY_REGISTRY);

  return (
    <div
      style={{
        minHeight: "100vh",
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
          {activities.map((activity) => (
            <Link
              key={activity.id}
              to={`/act/${activity.id}`}
              style={{
                display: "block",
                padding: 24,
                background: "var(--vsc-sidebar-bg)",
                border: "1px solid var(--vsc-border)",
                borderRadius: 8,
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.15s cubic-bezier(0.2, 0, 0, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--vsc-hover-bg)";
                e.currentTarget.style.borderColor = "var(--vsc-accent)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--vsc-sidebar-bg)";
                e.currentTarget.style.borderColor = "var(--vsc-border)";
                e.currentTarget.style.transform = "translateY(0)";
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
          ))}
        </div>
      </div>
    </div>
  );
}
