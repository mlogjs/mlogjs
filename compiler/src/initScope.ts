import {
  commands,
  Concat,
  DynamicArrayConstructor,
  MemoryBuilder,
  MlogMath,
  NamespaceMacro,
  Unchecked,
  VarsNamespace,
} from "./macros";
import { GetGlobal } from "./macros/GetGlobal";
import { Scope } from "./Scope";
import { EMutability } from "./types";
import { Asm } from "./macros/Asm";
import { LiteralValue } from "./values";

/**
 * Adds all the compiler globals to `scope`
 */
export function initScope(scope: Scope) {
  scope.hardSet("undefined", new LiteralValue(null));
  // namespaces
  scope.hardSet("ControlKind", new NamespaceMacro());
  scope.hardSet("Vars", new VarsNamespace());
  scope.hardSet("Teams", new NamespaceMacro());
  scope.hardSet("Items", new NamespaceMacro({ changeCasing: true }));
  scope.hardSet("Liquids", new NamespaceMacro());
  scope.hardSet("Units", new NamespaceMacro({ changeCasing: true }));
  scope.hardSet("LAccess", new NamespaceMacro());
  scope.hardSet("Blocks", new NamespaceMacro({ changeCasing: true }));

  // helper methods
  scope.hardSet("getBuilding", new GetGlobal(EMutability.constant));
  scope.hardSet("getVar", new GetGlobal(EMutability.mutable));
  scope.hardSet("concat", new Concat());
  scope.hardSet("asm", new Asm());

  scope.hardSet("Math", new MlogMath());
  scope.hardSet("Memory", new MemoryBuilder());
  scope.hardSet("MutableArray", new DynamicArrayConstructor(false));
  scope.hardSet("DynamicArray", new DynamicArrayConstructor(true));
  scope.hardSet("unchecked", new Unchecked());

  // commands
  scope.hardSet("draw", new commands.Draw());
  scope.hardSet("print", new commands.Print());
  scope.hardSet("printFlush", new commands.PrintFlush());
  scope.hardSet("drawFlush", new commands.DrawFlush());
  scope.hardSet("getLink", new commands.GetLink());
  scope.hardSet("control", new commands.Control());
  scope.hardSet("radar", new commands.Radar());
  scope.hardSet("sensor", new commands.Sensor());
  scope.hardSet("wait", new commands.Wait());
  scope.hardSet("lookup", new commands.Lookup());
  scope.hardSet("packColor", new commands.PackColor());
  scope.hardSet("endScript", new commands.End());
  scope.hardSet("stopScript", new commands.Stop());
  scope.hardSet("unitBind", new commands.UnitBind());
  scope.hardSet("unitControl", new commands.UnitControl());
  scope.hardSet("unitRadar", new commands.UnitRadar());
  scope.hardSet("unitLocate", new commands.UnitLocate());

  // world processor commands

  scope.hardSet("getBlock", new commands.GetBlock());
  scope.hardSet("setBlock", new commands.SetBlock());
  scope.hardSet("spawnUnit", new commands.SpawnUnit());
  scope.hardSet("applyStatus", new commands.ApplyStatus());
  scope.hardSet("spawnWave", new commands.SpawnWave());
  scope.hardSet("setRule", new commands.SetRule());
  scope.hardSet("flushMessage", new commands.FlushMessage());
  scope.hardSet("cutscene", new commands.Cutscene());
  scope.hardSet("explosion", new commands.Explosion());
  scope.hardSet("setRate", new commands.SetRate());
  scope.hardSet("fetch", new commands.Fetch());
  scope.hardSet("getFlag", new commands.GetFlag());
  scope.hardSet("setFlag", new commands.SetFlag());
  scope.hardSet("setProp", new commands.SetProp());
}
