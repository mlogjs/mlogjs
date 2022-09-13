import {
  commands,
  Concat,
  MemoryBuilder,
  MlogMath,
  NamespaceMacro,
  VarsNamespace,
} from "./macros";
import { GetGlobal } from "./macros/GetGlobal";
import { Scope } from "./Scope";
import { EMutability } from "./types";
import { Asm } from "./macros/Asm";

/**
 * Adds all the compiler globals to `scope`
 */
export function initScope(scope: Scope) {
  // namespaces
  scope.hardSet("ControlKind", new NamespaceMacro(scope));
  scope.hardSet("Vars", new VarsNamespace(scope));
  scope.hardSet("Teams", new NamespaceMacro(scope));
  scope.hardSet("Items", new NamespaceMacro(scope, { changeCasing: true }));
  scope.hardSet("Liquids", new NamespaceMacro(scope));
  scope.hardSet("Units", new NamespaceMacro(scope, { changeCasing: true }));
  scope.hardSet("LAccess", new NamespaceMacro(scope));
  scope.hardSet("Blocks", new NamespaceMacro(scope, { changeCasing: true }));

  // helper methods
  scope.hardSet("getBuilding", new GetGlobal(scope, EMutability.constant));
  scope.hardSet("getVar", new GetGlobal(scope, EMutability.mutable));
  scope.hardSet("concat", new Concat(scope));
  scope.hardSet("asm", new Asm(scope));

  scope.hardSet("Math", new MlogMath(scope));
  scope.hardSet("Memory", new MemoryBuilder(scope));

  // commands
  scope.hardSet("draw", new commands.Draw(scope));
  scope.hardSet("print", new commands.Print(scope));
  scope.hardSet("printFlush", new commands.PrintFlush(scope));
  scope.hardSet("drawFlush", new commands.DrawFlush(scope));
  scope.hardSet("getLink", new commands.GetLink(scope));
  scope.hardSet("control", new commands.Control(scope));
  scope.hardSet("radar", new commands.Radar(scope));
  scope.hardSet("sensor", new commands.Sensor(scope));
  scope.hardSet("wait", new commands.Wait(scope));
  scope.hardSet("lookup", new commands.Lookup(scope));
  scope.hardSet("packColor", new commands.PackColor(scope));
  scope.hardSet("endScript", new commands.End(scope));
  scope.hardSet("stopScript", new commands.Stop(scope));
  scope.hardSet("unitBind", new commands.UnitBind(scope));
  scope.hardSet("unitControl", new commands.UnitControl(scope));
  scope.hardSet("unitRadar", new commands.UnitRadar(scope));
  scope.hardSet("unitLocate", new commands.UnitLocate(scope));

  // world processor commands

  scope.hardSet("getBlock", new commands.GetBlock(scope));
  scope.hardSet("setBlock", new commands.SetBlock(scope));
  scope.hardSet("spawnUnit", new commands.SpawnUnit(scope));
}
