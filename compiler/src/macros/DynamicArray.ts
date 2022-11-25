import { assertIsArrayMacro, counterName, pipeInsts } from "../utils";
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
  lengthStore?: StoreValue;

  bundledSetter = false;
  bundledGetter = false;

  constructor(
    public scope: IScope,
    public name: string,
    public values: IValue[],
    dynamic: boolean
  ) {
    const getterName = `${name}.&gtemp`;
    const setterName = `${name}.&stemp`;
    const returnName = `${name}.&rt`;
    const lengthName = `${name}.&len`;
    const lengthStore = new StoreValue(lengthName);
    super({
      // array[index]
      $get: new MacroFunction((scope, out, index) =>
        this.getValue(scope, out, index, scope.checkIndexes)
      ),

      fill: new MacroFunction((scope, out, value) => {
        const inst: IInstruction[] = [];

        for (let i = 0; i < values.length; i++) {
          pipeInsts(values[i]["="](scope, value), inst);
        }
        if (this.lengthStore) {
          pipeInsts(
            this.lengthStore["="](scope, new LiteralValue(values.length)),
            inst
          );
        }

        return [null, inst];
      }),

      size: new LiteralValue(values.length),

      ...(dynamic
        ? {
            length: new StoreValue(lengthName, EMutability.readonly),
            push: new MacroFunction((scope, out, item) => {
              const checked = scope.checkIndexes;
              const entry = new DynamicArrayEntry(
                scope,
                this,
                lengthStore,
                checked
              );
              const [, inst] = entry["="](scope, item);
              return [new LiteralValue(null), inst];
            }),
            pop: new MacroFunction((scope, out) => {
              const checked = scope.checkIndexes;
              const inst: IInstruction[] = [];

              const index = pipeInsts(
                lengthStore["-"](scope, new LiteralValue(1)),
                inst
              );
              const failAddr = new LiteralValue(null);

              if (checked) {
                inst.push(
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

              const entry = new DynamicArrayEntry(scope, this, index, false);

              const result = pipeInsts(entry.eval(scope, out), inst);
              pipeInsts(entry["="](scope, new LiteralValue(null)), inst);
              inst.push(new AddressResolver(failAddr));
              return [result, inst];
            }),
          }
        : {}),
    });
    this.scope = scope;
    this.name = name;
    this.values = values;

    this.getterTemp = new SenseableValue(getterName, EMutability.mutable);
    this.setterTemp = new SenseableValue(setterName, EMutability.mutable);
    this.returnTemp = new StoreValue(returnName);
    if (dynamic) this.lengthStore = lengthStore;

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

      if (index.data < 0 || index.data >= values.length)
        throw new CompilerError(
          `The index ${index.data} is out of bounds: [0, ${values.length - 1}]`
        );
    }

    const entry = new DynamicArrayEntry(scope, this, index, checked);
    if (out) return entry.eval(scope, out);
    return [new DynamicArrayEntry(scope, this, index, checked), []];
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
    public index: IValue | LiteralValue<number>,
    public checked: boolean
  ) {
    super();
  }

  eval(scope: IScope, out?: TEOutput): TValueInstructions {
    const { checked, index } = this;

    if (index instanceof LiteralValue) {
      return [this.array.values[index.data], []];
    }

    this.array.initGetter();
    const inst: IInstruction[] = [];

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
    pipeInsts(returnTemp["="](scope, returnAdress), inst);

    const counter = new StoreValue(counterName);
    const doubleIndex = pipeInsts(
      index["*"](scope, new LiteralValue(itemSize)),
      inst
    );

    const line = pipeInsts(getterAddr["+"](scope, doubleIndex, counter), inst);
    pipeInsts(counter["="](scope, line), inst);

    inst.push(new AddressResolver(returnAdress));

    // without this you can't access the array twice inside the same expression
    pipeInsts(temp["="](scope, getterTemp), inst);

    if (checked) {
      inst.push(new AddressResolver(failAddr));
    }
    return [temp, inst];
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    const { checked, index } = this;
    const { setterTemp, values, setterAddr, returnTemp, lengthStore } =
      this.array;

    const inst: IInstruction[] = [];

    // where to jump in checked mode if the index is out of range
    const failAddress = new LiteralValue(null);

    if (index instanceof LiteralValue) {
      const member = values[index.data];
      pipeInsts(member["="](scope, value), inst);
    } else {
      this.array.initSetter();

      // used in both checked and unchecked modes
      // indicates where to jump after success
      const returnAdress = new LiteralValue(null);

      if (checked) {
        inst.push(
          new JumpInstruction(
            failAddress,
            EJumpKind.LessThan,
            index,
            new LiteralValue(0)
          ),
          new JumpInstruction(
            failAddress,
            EJumpKind.GreaterThan,
            index,
            new LiteralValue(values.length - 1)
          )
        );
      }

      pipeInsts(setterTemp["="](scope, value), inst);

      pipeInsts(returnTemp["="](scope, returnAdress), inst);

      const counter = new StoreValue(counterName);
      const doubleIndex = pipeInsts(
        index["*"](scope, new LiteralValue(itemSize)),
        inst
      );

      const line = pipeInsts(
        setterAddr["+"](scope, doubleIndex, counter),
        inst
      );

      pipeInsts(counter["="](scope, line), inst);

      inst.push(new AddressResolver(returnAdress));
    }

    if (lengthStore) {
      const len = pipeInsts(index["+"](scope, new LiteralValue(1)), inst);
      pipeInsts(lengthStore["="](scope, len), inst);
    }

    inst.push(new AddressResolver(failAddress));

    return [value, inst];
  }
}

export class DynamicArrayConstructor extends MacroFunction {
  constructor(dynamic: boolean) {
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
          const value = pipeInsts(
            init.get(scope, new LiteralValue(i), values[i]),
            inst
          );
          pipeInsts(values[i]["="](scope, value), inst);
        }
      }

      if (dynamic) {
        const lengthStore = new StoreValue(getLengthName(name));
        pipeInsts(
          lengthStore["="](
            scope,
            new LiteralValue(init instanceof ObjectValue ? length : 0)
          ),
          inst
        );
      }

      return [new DynamicArray(scope, name, values, dynamic), inst];
    });
  }
}

const getLengthName = (name: string) => `${name}.&len`;
