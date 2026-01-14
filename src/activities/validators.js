// src/activities/validators.js
// Mapa de validadores disponibles para ser referenciados por ID.
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
} from "../missionValidator";

export const validators = {
  m1: validateMission1,
  m2: validateMission2,
  m3: validateMission3,
  m4: validateMission4,
  m5: validateMission5,
  m6: validateMission6,
  m7: validateMission7,
  m8: validateMission8,
  m9: validateMission9,
};
