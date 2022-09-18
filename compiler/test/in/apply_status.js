const turret = getBuilding("foreshadow1");

const unit = radar(turret, "enemy", "any", "any", 1, "distance");

applyStatus("apply", "melting", unit, 20);
applyStatus("apply", "tarred", unit, 20);
