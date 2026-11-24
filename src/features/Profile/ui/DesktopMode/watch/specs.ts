import type { TWatchVariant } from "./model";

export type TStrapKind = "leather" | "bracelet" | "mesh";
export type TBezelKind = "polished" | "diver" | "tachymeter";
export type TMarkerKind = "roman" | "lume" | "index" | "baton";
export type THandShape = "leaf" | "sword" | "stick";

export interface IWatchSpec {
  strap: {
    kind: TStrapKind;
    base: string;
    shade: string;
    highlight: string;
    stitch: string;
  };
  metal: { light: string; mid: string; dark: string };
  caseRadius: number;
  dialRadius: number;
  bezel: TBezelKind;
  bezelColor: string;
  bezelInk: string;
  hasPushers: boolean;
  dial: { center: string; edge: string; ink: string; inkMuted: string };
  markers: TMarkerKind;
  lume: string;
  hasSubdials: boolean;
  subdial: { face: string; ink: string };
  hands: { shape: THandShape; fill: string; stroke: string; second: string };
}

const STEEL = { light: "#f4f6f8", mid: "#aab1ba", dark: "#5d646e" };

/** Набор данных, а не логика: один объект — один облик часов. */
export const WATCH_SPECS: Record<TWatchVariant, IWatchSpec> = {
  classic: {
    strap: { kind: "leather", base: "#6b3f22", shade: "#3f2312", highlight: "#8a5532", stitch: "#d8b98a" },
    metal: { light: "#fbe7b0", mid: "#d4a94f", dark: "#8a6424" },
    caseRadius: 112,
    dialRadius: 98,
    bezel: "polished",
    bezelColor: "#d4a94f",
    bezelInk: "#5a3f12",
    hasPushers: false,
    dial: { center: "#fbf6e9", edge: "#eadfc4", ink: "#2b2418", inkMuted: "rgba(43, 36, 24, 0.45)" },
    markers: "roman",
    lume: "#fbf6e9",
    hasSubdials: false,
    subdial: { face: "#f1e8d2", ink: "#2b2418" },
    hands: { shape: "leaf", fill: "#1f3d8f", stroke: "#162c66", second: "#1f3d8f" },
  },
  diver: {
    strap: { kind: "bracelet", base: "#c3c9d1", shade: "#6b737e", highlight: "#f2f4f6", stitch: "#4c535c" },
    metal: STEEL,
    caseRadius: 118,
    dialRadius: 90,
    bezel: "diver",
    bezelColor: "#141a24",
    bezelInk: "#e9eef4",
    hasPushers: false,
    dial: { center: "#1d2330", edge: "#07090d", ink: "#eef2f6", inkMuted: "rgba(238, 242, 246, 0.4)" },
    markers: "lume",
    lume: "#dcf5c4",
    hasSubdials: false,
    subdial: { face: "#10141c", ink: "#eef2f6" },
    hands: { shape: "sword", fill: "#dcf5c4", stroke: "#e9eef4", second: "#ff7a3d" },
  },
  minimal: {
    strap: { kind: "mesh", base: "#c9ced5", shade: "#7d848d", highlight: "#f6f7f9", stitch: "#9aa1aa" },
    metal: STEEL,
    caseRadius: 108,
    dialRadius: 102,
    bezel: "polished",
    bezelColor: "#d5d9de",
    bezelInk: "#4a5059",
    hasPushers: false,
    dial: { center: "#ffffff", edge: "#eef0f3", ink: "#1b1f26", inkMuted: "rgba(27, 31, 38, 0.3)" },
    markers: "index",
    lume: "#ffffff",
    hasSubdials: false,
    subdial: { face: "#f3f4f6", ink: "#1b1f26" },
    hands: { shape: "stick", fill: "#1b1f26", stroke: "#1b1f26", second: "#d6452f" },
  },
  chrono: {
    strap: { kind: "leather", base: "#22252b", shade: "#0e1013", highlight: "#3a3e46", stitch: "#c9ccd2" },
    metal: STEEL,
    caseRadius: 116,
    dialRadius: 92,
    bezel: "tachymeter",
    bezelColor: "#1a1d22",
    bezelInk: "#e6e9ee",
    hasPushers: true,
    dial: { center: "#f2f3f5", edge: "#d6d9de", ink: "#16191e", inkMuted: "rgba(22, 25, 30, 0.4)" },
    markers: "baton",
    lume: "#f2f3f5",
    hasSubdials: true,
    subdial: { face: "#15181d", ink: "#e9ecf0" },
    hands: { shape: "stick", fill: "#16191e", stroke: "#16191e", second: "#d6452f" },
  },
};
