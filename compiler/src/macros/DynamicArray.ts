import { assertIsArrayMacro } from "../assertions";
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
import { assign, extractOutName } from "../utils";
import {
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
  valueTemp: SenseableValue;
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
    super({
      // array.get(index)
      get: new MacroFunction((scope, out, index) =>
        this.getValue(scope, out, index, false)
      ),
      // array[index]
      $get: new MacroFunction((scope, out, index) =>
        this.getValue(scope, out, index, true)
      ),
      set: new MacroFunction((scope, out, index, value) =>
        this.setValue(scope, index, value, false)
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

    this.valueTemp = new SenseableValue(
      `${this.name}.&temp`,
      EMutability.mutable
    );
    this.returnTemp = new StoreValue(`${this.name}.&rt`);

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

    this.initGetter();

    const inst: IInstruction[] = [];

    // the value will be stored somewhere
    // no need to save it in a temporary variable
    const temp = out
      ? this.valueTemp
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
          new LiteralValue(this.values.length - 1)
        )
      );
    }

    const dIndexData = index["*"](scope, new LiteralValue(itemSize));
    inst.push(...dIndexData[1]);

    const dIndex = dIndexData[0];

    const lineData = this.getterAddr["+"](scope, dIndex);
    const line = lineData[0];
    inst.push(...lineData[1]);

    const returnAdress = new LiteralValue(null as never);
    inst.push(
      ...this.returnTemp["="](scope, returnAdress)[1],
      new SetCounterInstruction(line)
    );

    // without this you can't access the array twice inside the same expression
    inst.push(...temp["="](scope, this.valueTemp)[1]);

    if (checked) {
      inst.push(new AddressResolver(failAddr));
    }

    inst.push(new AddressResolver(returnAdress));

    return [temp, inst];
  }

  setValue(
    scope: IScope,
    index: IValue,
    value: IValue,
    checked: boolean
  ): TValueInstructions {}

  initGetter() {
    if (this.bundledGetter) return;
    this.bundledGetter = true;

    this.scope.inst.push(new AddressResolver(this.getterAddr));

    for (const value of this.values) {
      this.scope.inst.push(
        new SetInstruction(this.valueTemp, value),
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
        new SetInstruction(value, this.valueTemp),
        new SetCounterInstruction(this.returnTemp)
      );
    }
  }
}

export class DynamicArrayConstructor extends MacroFunction {
  constructor() {
    super((scope, out, init, fillValue?: IValue) => {
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

      if (init instanceof LiteralValue) {
        const value = fillValue ?? new LiteralValue(null as never);
        for (let i = 0; i < length; i++) {
          inst.push(...values[i]["="](scope, value)[1]);
        }
      } else {
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
