import { Block } from "./block";
import { Graph, getReversePostOrder } from "./graph";
import { GlobalId, ImmutableId } from "./id";
import {
  AllocLocalInstruction,
  BreakIfInstruction,
  BreakInstruction,
  EndIfInstruction,
  IBlockParamsInstruction,
  LoadInstruction,
  StoreInstruction,
  TBlockEndInstruction,
} from "./instructions";
import { ICompilerContext } from "../CompilerContext";
import { SourcePosition, SourceRange } from "../SourceRange";
import { CompilerError } from "../CompilerError";

export class SSABuilder {
  private currentDef = new Map<Block, Map<GlobalId, ImmutableId>>();
  private incompleteBlockParams = new Map<Block, Map<GlobalId, ImmutableId>>();
  private sealedBlocks = new Set<Block>();
  private filledBlocks = new Set<Block>();
  private aliasedParams = new Set<ImmutableId>();
  private valueLocations = new Map<ImmutableId, SourceRange>();
  private locals = new Set<GlobalId>();

  constructor(
    private c: ICompilerContext,
    private graph: Graph,
  ) {}

  run() {
    // 1. Traverse in Reverse Post Order (ient for forward data flow)
    const order = getReversePostOrder(this.graph.start);

    // Initialize sealed status: Entry is always sealed.
    // Others are unsealed until all parents are processed.
    this.sealedBlocks.add(this.graph.start);

    for (const block of order) {
      this.processBlock(block);

      this.filledBlocks.add(block);

      // Check if this block's completion allows us to seal any successors
      // (This handles the "back-edge" sealing logic for loops)
      for (const edge of block.childEdges) {
        const succ = edge.block;
        if (
          !this.sealedBlocks.has(succ) &&
          this.checkAllPredecessorsFinished(succ)
        ) {
          this.sealBlock(succ);
        }
      }
    }

    // Cleanup: Remove parameters that turned out to be trivial aliases
    this.removeTrivialParameters();
  }

  private checkAllPredecessorsFinished(block: Block): boolean {
    return block.parents.every(p => this.filledBlocks.has(p));
  }

  private processBlock(block: Block) {
    // local value numbering
    let current = block.instructions.head;
    while (current) {
      const node = current;
      const inst = node.instruction;
      current = current.next; // advance now in case we remove the node

      if (inst instanceof AllocLocalInstruction) {
        this.locals.add(inst.address);
        const undefId = this.c.createImmutableId();
        this.c.setGlobalAlias(undefId, inst.address);
        this.writeVariable(inst.address, block, undefId, inst.source);
      } else if (inst instanceof StoreInstruction) {
        this.writeVariable(inst.address, block, inst.value, inst.source);
        block.instructions.remove(node);
      } else if (inst instanceof LoadInstruction) {
        // can't optimize globals from outside
        if (!this.locals.has(inst.address)) continue;
        const val = this.readVariable(inst.address, block, inst.source);
        this.c.setAlias(inst.out, val);
        block.instructions.remove(node);
      }
    }
  }

  private writeVariable(
    variable: GlobalId,
    block: Block,
    value: ImmutableId,
    loc: SourceRange,
  ) {
    let defs = this.currentDef.get(block);
    if (!defs) {
      defs = new Map();
      this.currentDef.set(block, defs);
    }
    defs.set(variable, value);

    if (!this.valueLocations.has(value)) {
      this.valueLocations.set(value, loc);
    }
  }

  private readVariable(
    variable: GlobalId,
    block: Block,
    loc: SourceRange,
  ): ImmutableId {
    const defs = this.currentDef.get(block);
    if (defs?.has(variable)) {
      return defs.get(variable)!;
    }
    return this.readVariableRecursive(variable, block, loc);
  }

  private readVariableRecursive(
    variable: GlobalId,
    block: Block,
    loc: SourceRange,
  ): ImmutableId {
    let val: ImmutableId;

    if (!this.sealedBlocks.has(block)) {
      // handle incomplete cfg (loop header looking at back-edge)
      // create a proxy block parameter and record it. Operands will be added later in sealBlock.
      val = this.c.createImmutableId();

      // Add as Block Parameter (IR specific)
      block.parameters.push({ variable, value: val, loc });

      let params = this.incompleteBlockParams.get(block);
      if (!params) {
        params = new Map();
        this.incompleteBlockParams.set(block, params);
      }
      params.set(variable, val);
    } else if (block.parents.length === 1) {
      val = this.readVariable(variable, block.parents[0], loc);
    } else {
      // multiple predecessors.
      // place block parameter to break cycles.
      val = this.c.createImmutableId();
      block.parameters.push({ variable, value: val, loc });

      this.writeVariable(variable, block, val, loc);

      val = this.addBlockParamOperands(variable, val, block, loc);
    }

    this.writeVariable(variable, block, val, loc);
    return val;
  }

  private addBlockParamOperands(
    variable: GlobalId,
    paramId: ImmutableId,
    block: Block,
    loc: SourceRange,
  ): ImmutableId {
    const paramIndex = block.parameters.findIndex(p => p.value.equals(paramId));
    if (paramIndex === -1)
      throw new CompilerError("paramId not found in block parameters");

    for (const parent of block.parents) {
      const val = this.readVariable(variable, parent, loc);

      const end = parent.endInstruction;
      if (!isBlockParamsInstruction(end)) {
        throw new CompilerError(
          "Predecessor does not end in a branching instruction",
        );
      }

      // Ensure array is large enough (handling cases where we fill out of order)
      while (end.getBlockParameterCount(block) < paramIndex) {
        // Fill gaps if necessary (shouldn't happen if logic is correct)
        // @ts-ignore
        end.addBlockParameter(block, null);
      }
      end.addBlockParameter(block, {
        value: val,
        loc: this.valueLocations.get(val) ?? loc,
      });
    }

    return this.tryRemoveTrivialBlockParam(paramId, block);
  }

  private sealBlock(block: Block) {
    const params = this.incompleteBlockParams.get(block);
    if (params) {
      for (const [variable, param] of params) {
        // The block param was already created in readVariableRecursive.
        // Now we just fill the operands from the newly known predecessors.
        // We use an arbitrary location (block start/end) as we lack specific call-site info here.
        this.addBlockParamOperands(
          variable,
          param,
          block,
          this.valueLocations.get(param) ??
            new SourceRange(new SourcePosition(0, 0), new SourcePosition(0, 0)),
        );
      }
      this.incompleteBlockParams.delete(block);
    }
    this.sealedBlocks.add(block);
  }

  private tryRemoveTrivialBlockParam(
    paramId: ImmutableId,
    block: Block,
  ): ImmutableId {
    let same: ImmutableId | null = null;

    // Gather operands from all predecessors
    const paramIndex = block.parameters.findIndex(p => p.value.equals(paramId));
    const operands: ImmutableId[] = [];

    for (const pred of block.parents) {
      const end = pred.endInstruction as BreakInstruction;
      if (end.blockParameters[paramIndex]) {
        operands.push(end.blockParameters[paramIndex].value);
      }
    }

    for (const op of operands) {
      if (same?.equals(op) || op.equals(paramId)) continue; // Self-reference or duplicate

      if (same !== null) {
        return paramId; // Merges two distinct values -> Not trivial
      }
      same = op;
    }

    if (same === null) {
      return paramId;
    }

    this.aliasedParams.add(paramId);
    this.c.setAlias(paramId, same);

    return same;
  }

  private removeTrivialParameters() {
    const blocks = getReversePostOrder(this.graph.start);
    for (const block of blocks) {
      // Assuming Graph has getBlocks or we traverse
      // Iterate backwards to safe delete
      for (let i = block.parameters.length - 1; i >= 0; i--) {
        const val = block.parameters[i].value;
        // If this value is in our alias map, it was optimized away.
        if (this.aliasedParams.has(val)) {
          block.parameters.splice(i, 1);

          // Remove corresponding arguments from predecessors
          for (const pred of block.parents) {
            const end = pred.endInstruction as IBlockParamsInstruction;
            end.removeBlockParameter(block, i);
          }
          continue;
        }

        // handle trivial block parameters that weren't generated
        // by the builder
        const same = this.sameParentOperands(block.parents, i);
        if (!same) continue;
        block.parameters.splice(i, 1);
        this.c.setAlias(val, same);

        for (const pred of block.parents) {
          const end = pred.endInstruction as IBlockParamsInstruction;
          end.removeBlockParameter(block, i);
        }
      }
    }
  }

  private sameParentOperands(
    parents: Block[],
    paramIndex: number,
  ): ImmutableId | null {
    let first: ImmutableId | null = null;
    for (const parent of parents) {
      const end = parent.endInstruction as BreakInstruction;
      const operand = end.blockParameters[paramIndex]?.value;
      if (!operand) return null;

      if (first === null) {
        first = operand;
      } else if (!first.equals(operand)) {
        return null;
      }
    }
    return first;
  }
}

function isBlockParamsInstruction(
  inst?: TBlockEndInstruction,
): inst is BreakInstruction | BreakIfInstruction | EndIfInstruction {
  switch (inst?.type) {
    case "break":
    case "break-if":
    case "end-if":
      return true;
    default:
      return false;
  }
}
