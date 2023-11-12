import { cutscene, flushMessage } from "mlogjs:world";

const { switch1 } = getBuildings();

if (!switch1.enabled) endScript();

control.enabled(switch1, false);

cutscene.pan({ x: 10, y: 10, speed: 0.02 });
wait(0.5);
cutscene.zoom(4);

print("Camera controls!");
flushMessage.announce(4);
wait(5);
cutscene.stop();
