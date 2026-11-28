import plateSrc from "../assets/rain-plate.webp";
import { DriftingPlate } from "./DriftingPlate";
import { RainfallLayer } from "./RainfallLayer";

// Шпили пагоды и башни близко к верхнему краю: на сверхшироком экране бережём верх, а не самый край брусчатки.
const OBJECT_POSITION = "50% 25%";

// Сцена всегда ночная, поэтому от темы приложения не зависит.
export const RainBg = () => (
  <div className="absolute inset-0 overflow-hidden bg-black">
    <DriftingPlate src={plateSrc} objectPosition={OBJECT_POSITION} />
    <RainfallLayer />
  </div>
);
