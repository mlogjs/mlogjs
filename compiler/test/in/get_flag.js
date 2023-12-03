import { getFlag } from "mlogjs:world";

let dynamicFlag = "someFlag";

print`${getFlag("foo")}
${getFlag(dynamicFlag)}`;

printFlush();
