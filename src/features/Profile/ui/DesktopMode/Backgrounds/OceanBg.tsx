import plateSrc from "../assets/ocean-plate.webp";
import { DriftingPlate } from "./DriftingPlate";

// Маяк стоит справа: на узком экране режем левый край, а не скалу с маяком.
const OBJECT_POSITION = "72% 50%";

// Сцена всегда ночная, поэтому от темы приложения не зависит.
export const OceanBg = () => (
  <div className="absolute inset-0 overflow-hidden bg-black">
    <DriftingPlate src={plateSrc} objectPosition={OBJECT_POSITION} />
  </div>
);
