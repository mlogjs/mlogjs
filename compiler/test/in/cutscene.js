const switchBlock = getBuilding("switch1");

if (!switchBlock.enabled) endScript();

control.enabled(switchBlock, false);

cutscene.pan({ x: 10, y: 10, speed: 0.02 });
wait(0.5);
cutscene.zoom(4);

print("Camera controls!");
flushMessage.announce(4);
wait(5);
cutscene.stop();
