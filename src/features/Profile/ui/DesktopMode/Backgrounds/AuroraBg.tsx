import plateSrc from "../assets/aurora-plate.webp";
import { DriftingPlate } from "./DriftingPlate";
import { SnowfallLayer } from "./SnowfallLayer";

// Снег и избушка внизу важнее неба по краям: на узком экране режем бока, низ сохраняем.
const OBJECT_POSITION = "50% 100%";

// Сцена всегда ночная, поэтому от темы приложения не зависит.
export const AuroraBg = () => (
  <div className="absolute inset-0 overflow-hidden bg-black">
    <DriftingPlate src={plateSrc} objectPosition={OBJECT_POSITION} />
    <SnowfallLayer />
  </div>
);
