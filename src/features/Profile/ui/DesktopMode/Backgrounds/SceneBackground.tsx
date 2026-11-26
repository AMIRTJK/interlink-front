import type { TDesktopScene } from "../model";
import { SpaceBg } from "./SpaceBg";
import { AuroraBg } from "./AuroraBg";
import { RainBg } from "./RainBg";
import { CampfireBg } from "./CampfireBg";
import { ParticlesBg } from "./ParticlesBg";
import { OceanBg } from "./OceanBg";
import { MountainsBg } from "./MountainsBg";
import { ClockBg } from "./ClockBg";

interface IProps {
  scene: TDesktopScene;
  isDark: boolean;
}

export const SceneBackground = ({ scene, isDark }: IProps) => {
  switch (scene) {
    case "space":
      return <SpaceBg isDark={isDark} />;
    case "aurora":
      return <AuroraBg isDark={isDark} />;
    case "rain":
      return <RainBg isDark={isDark} />;
    case "campfire":
      return <CampfireBg />;
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
