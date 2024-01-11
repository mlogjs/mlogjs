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
import { EMutability, IScope, IValue } from "./types";
import { Asm } from "./macros/Asm";
import { ObjectValue } from "./values";
import { Scope } from "./Scope";
import { nullId, worldModuleName } from "./utils";
import { ICompilerContext } from "./CompilerContext";

/**
 * Creates the global scope of the user's script, contains all built-ins that
 * are not privileged
 */
export function createGlobalScope(c: ICompilerContext): IScope {
  const scope = new Scope({
    builtInModules: {
      [worldModuleName]: createWordModule(),
    },
  });

  scope.hardSet("undefined", nullId);

  const data: Record<string, IValue> = {
    // namespaces
    ControlKind: new NamespaceMacro(),
    Vars: new VarsNamespace(),
    Teams: new NamespaceMacro(),
    Items: new NamespaceMacro({ changeCasing: true }),
    Liquids: new NamespaceMacro(),
    Units: new NamespaceMacro({ changeCasing: true }),
    LAccess: new NamespaceMacro(),
    Blocks: new NamespaceMacro({ changeCasing: true }),

    // helper methods
    getBuilding: new GetGlobal(EMutability.constant),
    getBuildings: new GetBuildings(),
    getVar: new GetGlobal(EMutability.mutable),
    concat: new Concat(),
    asm: new Asm(),

    Math: new MlogMath(),
    Memory: new MemoryBuilder(),
    MutableArray: new DynamicArrayConstructor(false),
    DynamicArray: new DynamicArrayConstructor(true),
    unchecked: new Unchecked(),

    // commands
    draw: new commands.Draw(),
    print: new commands.Print(),
    printFlush: new commands.PrintFlush(),
    drawFlush: new commands.DrawFlush(),
    getLink: new commands.GetLink(),
    control: new commands.Control(),
    radar: new commands.Radar(),
    sensor: new commands.Sensor(),
    wait: new commands.Wait(),
    lookup: new commands.Lookup(),
    packColor: new commands.PackColor(),
    endScript: new commands.End(),
    stopScript: new commands.Stop(),
    unitBind: new commands.UnitBind(),
    unitControl: new commands.UnitControl(),
    unitRadar: new commands.UnitRadar(),
    unitLocate: new commands.UnitLocate(),
  };

  for (const name in data) {
    const id = c.registerValue(data[name]);
    c.setValueName(id, name);
    scope.set(name, id);
  }

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
  });
  return module;
}
