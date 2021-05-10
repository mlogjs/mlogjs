import { Identifier } from "../../temp/handler";
import { AddressResolver } from "../instructions";
import { es, THandler } from "../types";
import { StoreValue } from "../values";

export const FunctionExpression: THandler = (c, scope, node: es.FunctionExpression) => {
	scope = scope.createFunction();
    const {line, column} = node.loc.start
	node.params.forEach((param, i) => {
        const {name} = param as es.Identifier
        scope.make(name, [i, line, column].join(":"))
	});
    
    
	return [null, [
        ...c.handle(scope, node.body)[1],
    ]];
};
