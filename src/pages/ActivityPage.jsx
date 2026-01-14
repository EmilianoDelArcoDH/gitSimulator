// src/pages/ActivityPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import App from "../App";
import { getActivityById, listActivities } from "../activities/registry";
import { resetEnvironment } from "../envReset";
import { applySeedFiles } from "../activities/seedManager";
import { setCurrentActivityId } from "../activities/activityRuntime";

export default function ActivityPage() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const activity = useMemo(() => getActivityById(activityId), [activityId]);
  const activities = useMemo(() => listActivities(), []);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      if (!activity) return;
      setCurrentActivityId(activity.id);
      setResetting(true);
      try {
        await resetEnvironment();
        if (cancelled) return;
        await applySeedFiles(activity.seedFiles || []);
        if (cancelled) return;
        setResetKey((k) => k + 1);
      } finally {
        if (!cancelled) setResetting(false);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [activity]);

  if (!activity) {
    return (
      <div style={{ padding: 24, color: "var(--vsc-text, #e5e7eb)", fontFamily: "Segoe UI, sans-serif" }}>
        <h1 style={{ marginBottom: 8 }}>Actividad no encontrada</h1>
        <p style={{ marginTop: 0, marginBottom: 12 }}>
          No existe la actividad "{activityId}". Elegí una de la lista:
        </p>
        <ul>
          {activities.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => navigate(`/act/${a.id}`)}
                style={{ background: "none", border: "none", color: "#0ea5e9", cursor: "pointer" }}
              >
                {a.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <App
      key={`${activity.id}-${resetKey}`}
      activity={activity}
      allActivities={activities}
      navigateToActivity={(id) => navigate(`/act/${id}`)}
      resetting={resetting}
    />
  );
}
