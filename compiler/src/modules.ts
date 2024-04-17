import {
  commands,
  Concat,
  DynamicArrayConstructor,
  GetBuildings,
  GetColor,
  GetGlobal,
  MarkerConstructor,
  MemoryBuilder,
  MlogMath,
  NamespaceMacro,
  StringViewBuilder,
  Unchecked,
  VarsNamespace,
} from "./macros";
import { EMutability, IScope, IValue } from "./types";
import { Asm } from "./macros/Asm";
import { ObjectValue } from "./values";
import { Scope } from "./Scope";
import { nullId, worldModuleName } from "./utils";
import { ICompilerContext } from "./CompilerContext";
import { ColorsNamespace, SoundsNamespace } from "./macros/Namespace";

/**
 * Creates the global scope of the user's script, contains all built-ins that
 * are not privileged
 */
export function createGlobalScope(c: ICompilerContext): IScope {
  const scope = new Scope({
    builtInModules: {
      [worldModuleName]: c.registerValue(createWordModule(c)),
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
    Colors: new ColorsNamespace(),

    // helper methods
    getBuilding: new GetGlobal(EMutability.constant),
    getBuildings: new GetBuildings(),
    getVar: new GetGlobal(EMutability.mutable),
    getColor: new GetColor(),
    concat: new Concat(),
    asm: new Asm(),

    Math: new MlogMath(c),
    Memory: new MemoryBuilder(),
    StringView: new StringViewBuilder(),
    MutableArray: new DynamicArrayConstructor(false),
    DynamicArray: new DynamicArrayConstructor(true),
    unchecked: new Unchecked(),
    Align: new NamespaceMacro(),
    Weathers: new NamespaceMacro({ changeCasing: true }),
    Sounds: new SoundsNamespace(),

    // commands
    draw: new commands.Draw(c),
    print: new commands.Print(),
    format: new commands.Format(),
    printChar: new commands.PrintChar(),
    printFlush: new commands.PrintFlush(),
    drawFlush: new commands.DrawFlush(),
    getLink: new commands.GetLink(),
    control: new commands.Control(c),
    radar: new commands.Radar(),
    sensor: new commands.Sensor(),
    wait: new commands.Wait(),
    lookup: new commands.Lookup(c),
    packColor: new commands.PackColor(),
    unpackColor: new commands.UnpackColor(),
    endScript: new commands.End(),
    stopScript: new commands.Stop(),
    unitBind: new commands.UnitBind(),
    unitControl: new commands.UnitControl(c),
    unitRadar: new commands.UnitRadar(),
    unitLocate: new commands.UnitLocate(c),
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
    PVars: new NamespaceMacro(),
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
    SyncLock: new commands.SyncLockConstructor(),
    effect: new commands.Effect(),
    localePrint: new commands.LocalePrint(),
    Marker: new MarkerConstructor(),
    senseWeather: new commands.WeatherSense(),
    setWeather: new commands.WeatherSet(),
    playSound: new commands.PlaySound(),
  });
}
export function createWordModule(c: ICompilerContext) {
  const module = new ObjectValue(
    ObjectValue.autoRegisterData(c, {
      PVars: new NamespaceMacro(),
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
      SyncLock: new commands.SyncLockConstructor(),
      effect: new commands.Effect(),
      localePrint: new commands.LocalePrint(),
      Marker: new MarkerConstructor(),
      senseWeather: new commands.WeatherSense(),
      setWeather: new commands.WeatherSet(),
      playSound: new commands.PlaySound(),
    }),
  );
  return module;
}
