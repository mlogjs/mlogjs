import { applyStatus } from "mlogjs:world";

applyStatus.apply(StatusEffects.burning, Vars.unit, 10);
applyStatus.apply(StatusEffects.boss, Vars.unit);
applyStatus.apply("fast", Vars.unit, 5);
applyStatus.clear(StatusEffects.burning, Vars.unit);
