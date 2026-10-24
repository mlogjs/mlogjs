import { query, PVars } from "mlogjs:world";

query.circle({
  type: "unit",
  x: 10,
  y: 20,
  radius: 15,
});

const len = PVars.queries.length;
const first = PVars.queries[0];
const second = PVars.queries.at(1);
const raw = PVars.queries.value;

query.rect({
  type: "building",
  team: Teams.sharded,
  x: 0,
  y: 0,
  width: 50,
  height: 100,
});
