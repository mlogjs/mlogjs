import {
  assertIsArrayMacro,
  counterName,
  isDiscardedOut,
  pipeInsts,
} from "../utils";
import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  EJumpKind,
  InstructionBase,
  JumpInstruction,
  OperationInstruction,
  SetCounterInstruction,
  SetInstruction,
} from "../instructions";
import {
  EMutability,
  IBindableValue,
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
  removeAtAddr: LiteralValue<number | null>;
  lengthStore?: StoreValue;

  bundledSetter = false;
  bundledGetter = false;
  bundledRemoveAt = false;

  constructor(
    public scope: IScope,
    public name: string,
    public values: IValue[],
    public dynamic: boolean
  ) {
    const getterName = `${name}.&gtemp`;
    const setterName = `${name}.&stemp`;
    const returnName = `${name}.&rt`;
    const lengthName = getLengthName(name);
    const lengthStore = new StoreValue(lengthName);
    const sizeValue = new LiteralValue(values.length);
    super({
      // array[index]

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

      at: new MacroFunction((scope, out, index) => {
        const inst: IInstruction[] = [];

        const isLiteral = index instanceof LiteralValue;
        if (isLiteral) {
          assertBounds(index, -values.length, values.length - 1);
        }

        const indexTemp = isLiteral ? index : StoreValue.from(scope);

        const address = new LiteralValue(null);

        if (!isLiteral) {
          pipeInsts(indexTemp["="](scope, index), inst);
          inst.push(
            new JumpInstruction(
              address,
              EJumpKind.GreaterThanEq,
              indexTemp,
              new LiteralValue(0)
            )
          );
        }

        const finalIndex =
          isLiteral && index.data >= 0
            ? index
            : pipeInsts(
                indexTemp["+"](scope, this.lengthStore ?? sizeValue, indexTemp),
                inst
              );

        if (!isLiteral) inst.push(new AddressResolver(address));

        const entry = new DynamicArrayEntry({
          scope,
          array: this,
          index: finalIndex,
          checked: scope.checkIndexes,
        });
        const result = pipeInsts(entry.eval(scope, out), inst);
        return [result, inst];
      }),

      size: sizeValue,

      ...(dynamic
        ? {
            length: new StoreValue(lengthName, EMutability.readonly),
            push: new MacroFunction((scope, out, item) => {
              const checked = scope.checkIndexes;
              const entry = new DynamicArrayEntry({
                scope,
                array: this,
                index: lengthStore,
                checked,
              });
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

              const failAddress = new LiteralValue(null);

              const entry = new DynamicArrayEntry({
                scope,
                array: this,
                index,
                checked,
                newLength: index,
                failAddress,
              });

              const nullLiteral = new LiteralValue(null);

              const hasOut = !isDiscardedOut(out);

              const result = hasOut
                ? pipeInsts(entry.eval(scope, out), inst)
                : nullLiteral;

              // only add checks if the scope is checked and
              // aren't any previous checks
              entry.checked = checked && !hasOut;
              pipeInsts(entry["="](scope, nullLiteral), inst);

              inst.push(new AddressResolver(failAddress));
              return [result, inst];
            }),
            removeAt: new MacroFunction((scope, out, index) => {
              if (!index) throw new CompilerError("Missing index argument");
              this.initRemoveAt();
              if (index instanceof LiteralValue) {
                assertBounds(index, 0, values.length - 1);
              }
              const checked = scope.checkIndexes;
              const hasOut = !isDiscardedOut(out);
              const { returnTemp } = this;
              const inst: IInstruction[] = [];
              let result: IValue = new LiteralValue(null);

              const returnAdress = new LiteralValue(null);
              const failAddress = new LiteralValue(null);

              const upperBound = new JumpInstruction(
                failAddress,
                EJumpKind.GreaterThanEq,
                index,
                lengthStore
              );

              if (hasOut) {
                const entry = new DynamicArrayEntry({
                  scope,
                  array: this,
                  checked: scope.checkIndexes,
                  index,
                  failAddress,
                  upperBound,
                });

                if (index instanceof LiteralValue) {
                  const value = pipeInsts(entry.eval(scope), inst);
                  result = StoreValue.from(scope, out);

                  pipeInsts(result["="](scope, value), inst);
                } else {
                  result = pipeInsts(entry.eval(scope, out), inst);
                }
              }

              if (checked) {
                if (!hasOut && !(index instanceof LiteralValue)) {
                  inst.push(
                    new JumpInstruction(
                      failAddress,
                      EJumpKind.LessThan,
                      index,
                      new LiteralValue(0)
                    )
                  );
                }
                if (!hasOut || index instanceof LiteralValue)
                  inst.push(upperBound);
              }

              pipeInsts(returnTemp["="](scope, returnAdress), inst);

              const counter = new StoreValue(counterName);
              inst.push(
                new InstructionBase(
                  "op",
                  "add",
                  counter,
                  this.removeAtAddr,
                  index
                )
              );
              inst.push(new AddressResolver(returnAdress));
              pipeInsts(lengthStore["--"](scope, true), inst);
              inst.push(new AddressResolver(failAddress));
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
    this.removeAtAddr = new LiteralValue(null);
  }

  get(scope: IScope, index: IValue, out?: TEOutput): TValueInstructions {
    if (super.hasProperty(scope, index)) return super.get(scope, index, out);

    const { values } = this;

    if (index instanceof LiteralValue) {
      assertBounds(index, 0, values.length - 1);
    }

    const entry = new DynamicArrayEntry({
      scope,
      array: this,
      index,
      checked: scope.checkIndexes,
    });

    if (out) return entry.eval(scope, out);
    return [entry, []];
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    if (prop instanceof LiteralValue && prop.isNumber()) {
      return prop.data >= 0 && prop.data < this.values.length;
    }
    if (prop instanceof StoreValue) return true;

    return super.hasProperty(scope, prop);
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

  initRemoveAt() {
    if (this.bundledRemoveAt) return;
    this.bundledRemoveAt = true;

    const { inst } = this.scope;
    inst.push(new AddressResolver(this.removeAtAddr));

    for (let i = 0; i < this.values.length - 1; i++) {
      const value = this.values[i];
      const next = this.values[i + 1];

      pipeInsts(value["="](this.scope, next), inst);
    }
    const last = this.values[this.values.length - 1];
    pipeInsts(last["="](this.scope, new LiteralValue(null)), inst);
    inst.push(new SetCounterInstruction(this.returnTemp));
  }

  debugString() {
    const id = this.dynamic ? "DynamicArray" : "MutableArray";
    return `${id}("${this.name}")`;
  }

  toString() {
    const id = this.dynamic ? "DynamicArray" : "MutableArray";
    return `"[macro ${id}]"`;
  }
}

class DynamicArrayEntry extends BaseValue {
  macro = true;
  scope: IScope;
  array: DynamicArray;
  index: IValue | LiteralValue<number>;
  checked: boolean;
  newLength?: IValue;
  failAddress?: IBindableValue<number | null>;
  upperBound?: JumpInstruction;
  constructor({
    array,
    checked,
    index,
    scope,
    newLength,
    failAddress,
    upperBound,
  }: Pick<
    DynamicArrayEntry,
    | "scope"
    | "array"
    | "index"
    | "checked"
    | "newLength"
    | "failAddress"
    | "upperBound"
  >) {
    super();
    this.array = array;
    this.scope = scope;
    this.checked = checked;
    this.index = index;
    this.newLength = newLength;
    this.failAddress = failAddress;
    this.upperBound = upperBound;
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
    const temp =
      out instanceof StoreValue
        ? out
        : out
        ? getterTemp
        : SenseableValue.from(scope, undefined, EMutability.mutable);

    // used in checked mode, jumps to this address
    // if the index is out of bounds
    const failAddr = this.failAddress ?? new LiteralValue(null);

    if (checked) {
      inst.push(
        ...temp["="](scope, new LiteralValue(null))[1],
        new JumpInstruction(
          failAddr,
          EJumpKind.LessThan,
          index,
          new LiteralValue(0)
        ),
        this.upperBound ??
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

    if (checked && !this.failAddress) {
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
    const failAddress = this.failAddress ?? new LiteralValue(null);

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
          this.upperBound ??
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
      if (this.newLength) {
        pipeInsts(lengthStore["="](scope, this.newLength), inst);
      } else {
        const indexIsLength = index.name === lengthStore.name;

        const len = pipeInsts(
          index["+"](
            scope,
            new LiteralValue(1),
            indexIsLength ? lengthStore : undefined
          ),
          inst
        );
        if (!indexIsLength)
          inst.push(
            new OperationInstruction("max", lengthStore, len, lengthStore)
          );
      }
    }

    if (!this.failAddress) inst.push(new AddressResolver(failAddress));

    return [value, inst];
  }

  toOut(): IValue {
    return this.array.setterTemp;
  }

  debugString() {
    const name = this.array.dynamic ? "DynamicArray" : "MutableArray";
    return `${name}Entry`;
  }

  toString() {
    const name = this.array.dynamic ? "DynamicArray" : "MutableArray";
    return `"[macro ${name}Entry]"`;
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

function assertBounds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  index: LiteralValue<any>,
  min: number,
  max: number
): asserts index is LiteralValue<number> {
  if (!index.isNumber())
    throw new CompilerError("The index must be a store or a number literal");

  if (index.data < min || index.data > max)
    throw new CompilerError(
      `The index "${index.data}" is out of bounds: [${min}, ${max}]`
    );
}
