import { PVars, fetch } from "mlogjs:world";

const { driver1, driver2, bridge1, bridge2, node1, factory1 } = getBuildings();

// World processor control config
control.config(driver1, driver2);
control.config(bridge1, bridge2);
control.config(node1, factory1);

// World processor link sensing
const isDriverLinked = sensor(driver2, driver1);
const isBridgeLinked = sensor(bridge2, bridge1);
const isNodeLinked = sensor(factory1, node1);

// Privileged camera sensing via LAccess
const unit = fetch.unit(Teams.sharded, 0);
const camX = sensor(LAccess.cameraX, unit);
const camY = sensor(LAccess.cameraY, unit);
const camW = sensor(LAccess.cameraWidth, unit);
const camH = sensor(LAccess.cameraHeight, unit);

// Privileged camera sensing on clientUnit
const pCamX = PVars.clientUnit.cameraX;
const pCamY = PVars.clientUnit.cameraY;
const pCamW = PVars.clientUnit.cameraWidth;
const pCamH = PVars.clientUnit.cameraHeight;

print`cam: ${camX},${camY} ${camW}x${camH} | links: ${isDriverLinked},${isBridgeLinked},${isNodeLinked}`;
printFlush();
