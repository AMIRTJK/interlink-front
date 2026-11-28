import type { TDesktopScene } from "../model";
import type { TSpaceVariant } from "../space/model";
import { SpacePlateBg } from "./SpacePlateBg";
import { AuroraBg } from "./AuroraBg";
import { RainBg } from "./RainBg";
import { CampfireBg } from "./CampfireBg";
import { NewYearBg } from "./NewYearBg";
import { ParticlesBg } from "./ParticlesBg";
import { OceanBg } from "./OceanBg";
import { MountainsBg } from "./MountainsBg";
import { ClockBg } from "./ClockBg";

interface IProps {
  scene: TDesktopScene;
  spaceVariant: TSpaceVariant;
}

export const SceneBackground = ({ scene, spaceVariant }: IProps) => {
  switch (scene) {
    case "space":
      return <SpacePlateBg variant={spaceVariant} />;
    case "aurora":
      return <AuroraBg />;
    case "rain":
      return <RainBg />;
    case "campfire":
      return <CampfireBg />;
    case "newyear":
      return <NewYearBg />;
    case "particles":
      return <ParticlesBg />;
    case "ocean":
      return <OceanBg />;
    case "mountains":
      return <MountainsBg />;
    case "clock":
      return <ClockBg />;
    default:
      return null;
  }
};
