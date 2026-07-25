import { ComponentType, LazyExoticComponent, lazy, Suspense } from "react";
import { TWelcomeAnimation } from "@shared/config";
import { IWelcomeAnimationProps } from "../model";

type TAnimationComponent = LazyExoticComponent<
  ComponentType<IWelcomeAnimationProps>
>;

const ANIMATIONS: Record<TWelcomeAnimation, TAnimationComponent> = {
  dossier: lazy(() =>
    import("./animations/DossierAnimation").then((m) => ({
      default: m.DossierAnimation,
    })),
  ),
  neural: lazy(() =>
    import("./animations/NeuralAnimation").then((m) => ({
      default: m.NeuralAnimation,
    })),
  ),
  aurora: lazy(() =>
    import("./animations/AuroraAnimation").then((m) => ({
      default: m.AuroraAnimation,
    })),
  ),
  orbit: lazy(() =>
    import("./animations/OrbitAnimation").then((m) => ({
      default: m.OrbitAnimation,
    })),
  ),
  protocol: lazy(() =>
    import("./animations/ProtocolAnimation").then((m) => ({
      default: m.ProtocolAnimation,
    })),
  ),
};

interface IProps extends IWelcomeAnimationProps {
  animation: TWelcomeAnimation;
}

export const WelcomeStage = ({ animation, ...rest }: IProps) => {
  const Animation = ANIMATIONS[animation];

  return (
    <Suspense
      fallback={
        <div
          className={`absolute top-1/2 left-1/2 h-[50%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${rest.themeGradient} opacity-20 blur-[130px]`}
        />
      }
    >
      <Animation {...rest} />
    </Suspense>
  );
};
