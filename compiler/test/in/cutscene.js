const switchBlock = getBuilding("switch1");

if (!switchBlock.enabled) endScript();

control({
  mode: "enabled",
  building: switchBlock,
  value: false,
});

cutscene("pan", 10, 10, 0.02);
wait(0.5);
cutscene("zoom", 4);

print("Camera controls!");
flushMessage("announce", 4);
wait(5);
cutscene("stop");
