import { Exp, Program, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isDefineExp, isProcExp, isIfExp, isAppExp, CExp, makeAppExp} from '../imp/L2-ast';
import { Result, bind, mapResult, makeOk, safe3, safe2, makeFailure } from '../imp/result';
import { unparseL2 } from '../imp/L2-unparse';
import { map } from 'ramda';


    // + 1 2 => 1 + 2
const equalCheck = (op: string): string =>
    op === "=" ? "===" : op

const bigBody = (body: string[]): string =>{
    if (body.length <= 1){ 
        return (body.join(""));
    }
    else{
        const lastVar = body[body.length-1];
        return "{" + (body.slice(0, body.length-1).join("; ") + "; return " +  lastVar +";}")
    }
}

const maybeConsole = (exps:string[]): string =>{
    if (exps.length <= 1)
        return exps.join(";\n");
        else{
            const lastvar = exps[exps.length-1];
            return exps.slice(0, exps.length-1).join(";\n") + ";\nconsole.log(" + lastvar + ");"
        }
}

const transformPrimOp = (op:string) : string =>
    op==="not"? "!":
    op==="and"? "&":
    op==="or"? "|":
    op==="="? "===":
    op;

/*
Purpose: trasnform an L2 program into a JS program
Signature: l2ToJS(exp: Exp | Program)
Type: (exp: Exp | Program): Result<string>
*/
export const l2ToJS = (exp: Exp | Program): Result<string> => 
    isProgram(exp) ? bind(mapResult(l2ToJS, exp.exps), (exps: string[]) => makeOk(maybeConsole(exps))) :
    isBoolExp(exp) ? makeOk(exp.val ? "true" : "false") :
    isNumExp(exp) ? makeOk(exp.val.toString()) :
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(transformPrimOp(exp.op)) :
    isDefineExp(exp) ? bind(l2ToJS(exp.val), (val: string) => makeOk(`const ${exp.var.var} = ${val}`)) :
    isProcExp(exp) ? bind(mapResult(l2ToJS, exp.body), (body: string[]) => makeOk(`((${map(v => v.var, exp.args).join(",")}) => ${bigBody(body)})`)) :
    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(${test} ? ${then} : ${alt})`))
                    (l2ToJS(exp.test), l2ToJS(exp.then), l2ToJS(exp.alt)) :
    isAppExp(exp) ? safe2((rator: string, rands: string[]) => 
                        !isPrimOp(exp.rator)? makeOk(`${rator}(${rands.join(",")})`) :
                         rator==="!"? makeOk('(!'+rands+')'):
                        makeOk(`(${rands.join(" " + rator + " ")})`))
                        (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
    makeFailure(`Unknown expression: ${exp}`);
