import { assertIsArrayMacro, counterName } from "../utils";
import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  EJumpKind,
  JumpInstruction,
  SetCounterInstruction,
  SetInstruction,
} from "../instructions";
import {
  EMutability,
  IInstruction,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { extractOutName } from "../utils";
import {
  BaseValue,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../values";
import { MacroFunction } from "./Function";

/**
 * The size of a dynamic array iteration item.
 * Includes the set counter instruction
 */
const itemSize = 2;

export class DynamicArray extends ObjectValue {
  getterTemp: SenseableValue;
  setterTemp: SenseableValue;
  returnTemp: StoreValue;
  getterAddr: LiteralValue<number | null>;
  setterAddr: LiteralValue<number | null>;

  bundledSetter = false;
  bundledGetter = false;

  constructor(
    public scope: IScope,
    public name: string,
    public values: IValue[]
  ) {
    const getterName = `${name}.&gtemp`;
    const setterName = `${name}.&stemp`;
    const returnName = `${name}.&rt`;
    super({
      // array[index]
      $get: new MacroFunction((scope, out, index) =>
        this.getValue(scope, out, index, scope.checkIndexes)
      ),

      fill: new MacroFunction((scope, out, value) => {
        const inst: IInstruction[] = [];

        for (let i = 0; i < values.length; i++) {
          inst.push(...values[i]["="](scope, value)[1]);
        }

        return [null, inst];
      }),

      length: new LiteralValue(values.length),
    });
    this.scope = scope;
    this.name = name;
    this.values = values;

    this.getterTemp = new SenseableValue(getterName, EMutability.mutable);
    this.setterTemp = new SenseableValue(setterName, EMutability.mutable);
    this.returnTemp = new StoreValue(returnName);

    this.getterAddr = new LiteralValue(null);
    this.setterAddr = new LiteralValue(null);
  }

  getValue(
    scope: IScope,
    out: TEOutput | undefined,
    index: IValue,
    checked: boolean
  ): TValueInstructions {
    if (!index) throw new CompilerError("Missing index argument");
    const { values } = this;

    if (index instanceof LiteralValue) {
      if (!index.isNumber())
        throw new CompilerError(`Unknown dynamic array property: "${index}"`);
      if (index.data >= 0 && index.data < values.length)
        return [values[index.data], []];

      throw new CompilerError(
        `The index ${index.data} is out of bounds: [0, ${values.length - 1}]`
      );
    }

    const entry = new DynamicArrayEntry(scope, this, index, checked);
    if (out) return entry.eval(scope, out);
    return [new DynamicArrayEntry(scope, this, index, checked), []];
  }

  setValue(
    scope: IScope,
    index: IValue,
    value: IValue,
    checked: boolean
  ): TValueInstructions {
    const entry = new DynamicArrayEntry(scope, this, index, checked);

    return entry["="](scope, value);
  }

  initGetter() {
    if (this.bundledGetter) return;
    this.bundledGetter = true;

    this.scope.inst.push(new AddressResolver(this.getterAddr));

    for (const value of this.values) {
      this.scope.inst.push(
        new SetInstruction(this.getterTemp, value),
        new SetCounterInstruction(this.returnTemp)
      );
    }
  }

  initSetter() {
    if (this.bundledSetter) return;
    this.bundledSetter = true;

    this.scope.inst.push(new AddressResolver(this.setterAddr));

    for (const value of this.values) {
      this.scope.inst.push(
        new SetInstruction(value, this.setterTemp),
        new SetCounterInstruction(this.returnTemp)
      );
    }
  }
}

class DynamicArrayEntry extends BaseValue {
  constructor(
    public scope: IScope,
    public array: DynamicArray,
    public index: IValue,
    public checked: boolean
  ) {
    super();
  }

  eval(scope: IScope, out?: TEOutput): TValueInstructions {
    this.array.initGetter();
    const inst: IInstruction[] = [];

    const { checked, index } = this;
    const { getterTemp, values, getterAddr, returnTemp } = this.array;

    // the value will be stored somewhere
    // no need to save it in a temporary variable
    const temp = out
      ? getterTemp
      : SenseableValue.from(scope, undefined, EMutability.mutable);

    // used in checked mode, jumps to this address
    // if the index is out of bounds
    const failAddr = new LiteralValue(null);

    if (checked) {
      inst.push(
        ...temp["="](scope, new LiteralValue(null))[1],
        new JumpInstruction(
          failAddr,
          EJumpKind.LessThan,
          index,
          new LiteralValue(0)
        ),
        new JumpInstruction(
          failAddr,
          EJumpKind.GreaterThan,
          index,
          new LiteralValue(values.length - 1)
        )
      );
    }

    const returnAdress = new LiteralValue(null);
    inst.push(...returnTemp["="](scope, returnAdress)[1]);

    const counter = new StoreValue(counterName);
    const dIndexData = index["*"](scope, new LiteralValue(itemSize));
    inst.push(...dIndexData[1]);

    const lineData = getterAddr["+"](scope, dIndexData[0], counter);
    inst.push(...lineData[1], ...counter["="](scope, lineData[0])[1]);

    inst.push(new AddressResolver(returnAdress));

    // without this you can't access the array twice inside the same expression
    inst.push(...temp["="](scope, getterTemp)[1]);

    if (checked) {
      inst.push(new AddressResolver(failAddr));
    }
    return [temp, inst];
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    this.array.initSetter();
    const inst: IInstruction[] = [];

    const { checked, index } = this;
    const { setterTemp, values, setterAddr, returnTemp } = this.array;

    // used in both checked and unchecked modes
    // indicates where to jump after sucess or failure
    const returnAdress = new LiteralValue(null);

    if (checked) {
      inst.push(
        new JumpInstruction(
          returnAdress,
          EJumpKind.LessThan,
          index,
          new LiteralValue(0)
        ),
        new JumpInstruction(
          returnAdress,
          EJumpKind.GreaterThan,
          index,
          new LiteralValue(values.length - 1)
        )
      );
    }

    inst.push(...setterTemp["="](scope, value)[1]);

    inst.push(...returnTemp["="](scope, returnAdress)[1]);

    const counter = new StoreValue(counterName);
    const dIndexData = index["*"](scope, new LiteralValue(itemSize));
    inst.push(...dIndexData[1]);

    const lineData = setterAddr["+"](scope, dIndexData[0], counter);
    inst.push(...lineData[1], ...counter["="](scope, lineData[0])[1]);

    inst.push(new AddressResolver(returnAdress));

    return [value, inst];
  }
}

export class DynamicArrayConstructor extends MacroFunction {
  constructor() {
    super((scope, out, init) => {
      const name = extractOutName(out) ?? scope.makeTempName();
      const inst: IInstruction[] = [];
      const values: IValue[] = [];
      let length: number;

      if (init instanceof LiteralValue && typeof init.data === "number") {
        length = init.data;
      } else if (init instanceof ObjectValue) {
        assertIsArrayMacro(init, "The array initializer");
        length = init.data.length.data;
      } else {
        throw new CompilerError(
          "The dynamic array initializer must be an array macro or a number literal"
        );
      }

      for (let i = 0; i < length; i++) {
        values.push(new SenseableValue(`${name}->${i}`, EMutability.mutable));
      }

      if (init instanceof ObjectValue) {
        const length = init.data.length.data;

        for (let i = 0; i < length; i++) {
          const [value, valueInst] = init.get(
            scope,
            new LiteralValue(i),
            values[i]
          );

          inst.push(...valueInst);
          inst.push(...values[i]["="](scope, value)[1]);
        }
      }

      return [new DynamicArray(scope, name, values), inst];
    });
  }
}
