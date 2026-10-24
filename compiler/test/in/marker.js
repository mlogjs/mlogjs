import { Marker } from "mlogjs:world";

const m = Marker.shape({ id: 1, x: 10, y: 20, replace: true });
m.world = true;
m.light = true;
m.radius = 5;
m.arc = { start: 0, end: 180 };
m.color = packColor(1, 0, 0, 1);

const line = Marker.line({ id: 2, x: 0, y: 0, replace: false });
line.posi = { index: 0, x: 5, y: 5 };

const existing = Marker.of(1);
existing.radius = 10;
existing.remove();
