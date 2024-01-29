import { ImmutableId } from "../flow/id";

/** The prefix for internal variables inside the compiler output */
export const internalPrefix = "&";
export const discardedName = `${internalPrefix}_`;

export const itemNames = [
  "copper",
  "lead",
  "metaglass",
  "graphite",
  "sand",
  "coal",
  "titanium",
  "thorium",
  "scrap",
  "silicon",
  "plastanium",
  "phaseFabric",
  "surgeAlloy",
  "sporePod",
  "blastCompound",
  "pyratite",
  "beryllium",
  "tungsten",
  "oxide",
  "carbide",
  "fissileMatter",
  "dormantCyst",
];

/** The name of a special processor variable, controls the instruction pointer */
export const counterName = "@counter";
export const worldModuleName = "mlogjs:world";

export const mathConstants = {
  E: Math.E,
  PI: Math.PI,
  radToDeg: 180 / Math.PI,
  degToRad: Math.PI / 180,
};

export const nullId = new ImmutableId();
