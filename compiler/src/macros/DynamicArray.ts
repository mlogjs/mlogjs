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
  IOwnedValue,
  IScope,
  IValue,
  TValueInstructions,
} from "../types";
import { assign } from "../utils";
import {
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../values";
import { ValueOwner } from "../values/ValueOwner";
import { MacroFunction } from "./Function";

/**
 * The size of a dynamic array iteration item.
 * Includes the set counter instruction
 */
const itemSize = 2;

export class DynamicArray extends ObjectValue {
  valueTemp: ValueOwner<SenseableValue>;
  returnTemp: ValueOwner<StoreValue>;
  getterAddr: LiteralValue;
  setterAddr: LiteralValue;

  bundledSetter = false;
  bundledGetter = false;

  constructor(public scope: IScope, public values: IValue[]) {
    super({
      // array.get(index)
      get: new MacroFunction((scope, index) =>
        this.getValue(scope, index, false)
      ),
      // array[index]
      $get: new MacroFunction((scope, index) =>
        this.getValue(scope, index, true)
      ),
      set: new MacroFunction((scope, index, value) =>
        this.setValue(scope, index, value, false)
      ),

      fill: new MacroFunction((scope, value) => {
        const inst: IInstruction[] = [];

        for (let i = 0; i < values.length; i++) {
          inst.push(...values[i]["="](scope, value)[1]);
        }

        return [null, inst];
      }),
    });

    this.valueTemp = new ValueOwner({
      scope,
      value: assign(new SenseableValue(scope), {
        mutability: EMutability.mutable,
      }),
      constant: false,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      name: () => `${this.owner!.name}.&temp`,
    });

    this.returnTemp = new ValueOwner({
      scope,
      value: new StoreValue(scope),
      constant: false,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      name: () => `${this.owner!.name}.&rt`,
    });

    this.getterAddr = new LiteralValue(null as never);
    this.setterAddr = new LiteralValue(null as never);
  }

  getValue(scope: IScope, index: IValue, checked: boolean): TValueInstructions {
    const { values } = this;

    if (!index) throw new CompilerError("Missing index argument");

    if (index instanceof LiteralValue && typeof index.data === "number") {
      if (index.data >= 0 && index.data < values.length)
        return [values[index.data], []];

      throw new CompilerError(
        `The index ${index.data} is out of bounds: [0, ${values.length - 1}]`
      );
    }

    this.initGetter();

    const inst: IInstruction[] = [];

    const temp = assign(new SenseableValue(scope), {
      mutability: EMutability.mutable,
    });

    // used in checked mode, jumps to this address
    // if the index is out of bounds
    const failAddr = new LiteralValue(null as never);

    if (checked) {
      inst.push(
        ...temp["="](scope, new LiteralValue(null as never))[1],
        new JumpInstruction(
          failAddr,
          EJumpKind.LessThan,
          index,
          new LiteralValue(0)
        ),
        new JumpInstruction(
          failAddr,
          EJumpKind.GreaterThanEq,
          index,
          new LiteralValue(this.values.length)
        )
      );
    }

    const dIndexData = index["*"](scope, new LiteralValue(itemSize));
    inst.push(...dIndexData[1]);

    const dIndex: IValue = dIndexData[0];
    dIndex.ensureOwned();

    const lineData = this.getterAddr["+"](scope, dIndex);
    const line: IValue = lineData[0];
    line.ensureOwned();
    inst.push(...lineData[1], new SetCounterInstruction(line));

    // without this you can't access the array twice inside the same expression
    inst.push(...temp["="](scope, this.valueTemp.value)[1]);

    if (checked) {
      inst.push(new AddressResolver(failAddr));
    }

    const returnAdress = new LiteralValue(null as never);
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
        new SetInstruction(this.valueTemp.value, value),
        new SetCounterInstruction(this.returnTemp.value)
      );
    }
  }

  initSetter() {
    if (this.bundledSetter) return;
    this.bundledSetter = true;

    this.scope.inst.push(new AddressResolver(this.setterAddr));

    for (const value of this.values) {
      this.scope.inst.push(
        new SetInstruction(value, this.valueTemp.value),
        new SetCounterInstruction(this.returnTemp.value)
      );
    }
  }

  ensureOwned(): asserts this is IOwnedValue {
    if (this.owner) return;
    new ValueOwner({ scope: this.scope, value: this });
  }
}

export class DynamicArrayConstructor extends MacroFunction {
  constructor() {
    super((scope, init, fillValue?: IValue) => {
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
        values.push(
          new ValueOwner({
            scope,
            value: assign(new SenseableValue(scope), {
              mutability: EMutability.mutable,
            }),
            constant: false,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            name: () => `${out.owner!.name}->${i}`,
          }).value
        );
      }

      if (init instanceof LiteralValue) {
        const value = fillValue ?? new LiteralValue(null as never);
        for (let i = 0; i < length; i++) {
          inst.push(...values[i]["="](scope, value)[1]);
        }
      } else {
        const length = init.data.length.data;

        for (let i = 0; i < length; i++) {
          const [value, valueInst] = init.get(scope, new LiteralValue(i));

          inst.push(...valueInst);
          inst.push(...values[i]["="](scope, value)[1]);
        }
      }

      const out = new DynamicArray(scope, values);
      new ValueOwner({ scope, constant: true, value: out });
      return [out, inst];
    });
  }
}
