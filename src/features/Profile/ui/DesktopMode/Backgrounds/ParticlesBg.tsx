import plateSrc from "../assets/particles-plate.webp";
import { DriftingPlate } from "./DriftingPlate";
import { ParticlesLayer } from "./ParticlesLayer";

// Главный кластер стеклянных и золотых сфер стоит справа: на узком экране режем левый край.
const OBJECT_POSITION = "72% 55%";

// Сцена всегда ночная, поэтому от темы приложения не зависит.
export const ParticlesBg = () => (
  <div className="absolute inset-0 overflow-hidden bg-black">
    <DriftingPlate src={plateSrc} objectPosition={OBJECT_POSITION} />
    <ParticlesLayer />
  </div>
);
