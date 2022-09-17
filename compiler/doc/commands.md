# Commands

Commands are built in function macros that expand into instructions during compilation.

Here is a list of them, some have multiple overloads

- `print` - Adds data to the print buffer
- `draw` - Adds data to the draw buffer
- `printFlush` - Empties the buffer and prints its contents on the target message block
- `drawFlush` - Empties the draw buffer and draws its contents on the target display block
- `getLink` - Gets a block linked to the processor via its index
- `control` - Controls a given block
- `radar` - Uses a block (usually a turret) to detect units nearby
- `sensor` - Detect properties of values (only use if you know what you are doing)
- `wait` - Pauses execution for the given amount of seconds
- `lookup` - Finds a symbol for a kind of content based on its index
- `unitBind` - Binds an unit of a given type to the processor
- `unitControl` - Controls the unit bound to the processor
- `unitRadar` - Uses the unit bound to the processor to find nearby units
- `unitLocate` - Uses the unit bound to the processor to find blocks
- `endScript` - Ends the execution of the script (compiles into an `end` instruction)
