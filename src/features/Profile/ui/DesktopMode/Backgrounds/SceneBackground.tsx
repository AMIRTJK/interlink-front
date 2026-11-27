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
  isDark: boolean;
  spaceVariant: TSpaceVariant;
}

export const SceneBackground = ({ scene, isDark, spaceVariant }: IProps) => {
  switch (scene) {
    case "space":
      return <SpacePlateBg variant={spaceVariant} />;
    case "aurora":
      return <AuroraBg isDark={isDark} />;
    case "rain":
      return <RainBg isDark={isDark} />;
    case "campfire":
      return <CampfireBg />;
    case "newyear":
      return <NewYearBg />;
    case "particles":
      return <ParticlesBg isDark={isDark} />;
    case "ocean":
      return <OceanBg isDark={isDark} />;
    case "mountains":
      return <MountainsBg isDark={isDark} />;
    case "clock":
      return <ClockBg isDark={isDark} />;
    default:
      return null;
  }
};
