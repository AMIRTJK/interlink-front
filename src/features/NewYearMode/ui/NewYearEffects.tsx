import { If } from "@shared/ui";
import type { TNewYearEffect } from "../model";
import { Snowfall } from "./Snowfall";
import { Garland } from "./Garland";
import { NewYearCountdown } from "./NewYearCountdown";
import "../style.css";

interface IProps {
  effects: Record<TNewYearEffect, boolean>;
  isBottomNav: boolean;
  isReducedMotion: boolean;
}

// Отдельный чанк: грузится только когда режим включён.
const NewYearEffects = ({ effects, isBottomNav, isReducedMotion }: IProps) => (
  <>
    <If is={effects.snow && !isReducedMotion}>
      <Snowfall />
    </If>
    <If is={effects.garland}>
      <Garland />
    </If>
    <If is={effects.countdown}>
      <NewYearCountdown isBottomNav={isBottomNav} />
    </If>
  </>
);

export default NewYearEffects;
