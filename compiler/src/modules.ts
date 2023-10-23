import {
  commands,
  Concat,
  DynamicArrayConstructor,
  GetBuildings,
  MemoryBuilder,
  MlogMath,
  NamespaceMacro,
  Unchecked,
  VarsNamespace,
} from "./macros";
import { GetGlobal } from "./macros/GetGlobal";
import { EMutability, IScope } from "./types";
import { Asm } from "./macros/Asm";
import { LiteralValue, ObjectValue } from "./values";
import { Scope } from "./Scope";
import { worldModuleName } from "./utils";

/**
 * Creates the global scope of the user's script, contains all built-ins that
 * are not privileged
 */
export function createGlobalScope(): IScope {
  const scope = new Scope({
    builtInModules: {
      [worldModuleName]: createWordModule(),
    },
  });
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
  scope.hardSet("getBuildings", new GetBuildings());
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

  return scope;
}

export function createWordModule() {
  const module = new ObjectValue({
    getBlock: new commands.GetBlock(),
    setBlock: new commands.SetBlock(),
    spawnUnit: new commands.SpawnUnit(),
    applyStatus: new commands.ApplyStatus(),
    spawnWave: new commands.SpawnWave(),
    setRule: new commands.SetRule(),
    flushMessage: new commands.FlushMessage(),
    cutscene: new commands.Cutscene(),
    explosion: new commands.Explosion(),
    setRate: new commands.SetRate(),
    fetch: new commands.Fetch(),
    getFlag: new commands.GetFlag(),
    setFlag: new commands.SetFlag(),
    setProp: new commands.SetProp(),
    sync: new commands.Sync(),
    effect: new commands.Effect(),
  });
  return module;
}
