import plateSrc from "../assets/mountains-plate.webp";
import { DriftingPlate } from "./DriftingPlate";

// Пик с огоньком стоит справа: на узком экране режем левый край, а не вершину.
const OBJECT_POSITION = "75% 50%";

// Сцена всегда ночная, поэтому от темы приложения не зависит.
export const MountainsBg = () => (
  <div className="absolute inset-0 overflow-hidden bg-black">
    <DriftingPlate src={plateSrc} objectPosition={OBJECT_POSITION} />
  </div>
);
