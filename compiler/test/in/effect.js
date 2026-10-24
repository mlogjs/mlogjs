import { effect } from "mlogjs:world";

effect.warn(10, 20);
effect.explosion(30, 40, 5);
effect.breakProp({ x: 10, y: 10, color: 1, size: 2 });
effect.breakPop({ x: 15, y: 15, color: 1, size: 2 });
effect.trail({ x: 0, y: 0, color: 1, size: 1 });
effect.smokeColor({ x: 5, y: 5, color: 1, rotation: 90 });
