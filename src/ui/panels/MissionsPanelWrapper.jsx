// src/ui/panels/MissionsPanelWrapper.jsx
import React from "react";
import { validators } from "../../activities/validators";
import MissionsPanel from "../../MissionsPanel";

/**
 * Adaptador que toma missions declaradas en la actividad (con validatorKey)
 * y ejecuta el validador correspondiente.
 */
export default function MissionsPanelWrapper({ activity, theme }) {
  const missions = activity?.missions || [];

  const runValidator = async (validatorKey) => {
    const fn = validators[validatorKey];
    if (!fn) {
      return {
        ok: false,
        errors: [
          `No hay validador registrado para "${validatorKey}" en esta actividad. ` +
            "Verificá la configuración de la actividad o probá con otra misión.",
        ],
      };
    }
    try {
      return await fn();
    } catch (e) {
      return {
        ok: false,
        errors: [
          e?.message || String(e) || "Error al ejecutar el validador.",
        ],
      };
    }
  };

  return <MissionsPanel missions={missions} theme={theme} runValidator={runValidator} />;
}
