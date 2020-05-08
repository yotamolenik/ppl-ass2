import { map } from "ramda";
import { Exp, Program, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isDefineExp, isProcExp, isIfExp, isAppExp, isForExp } from "./L21-ast";
import { Result, makeOk, makeFailure, mapResult, bind, safe3, safe2 } from "../imp/result";

export const unparseL21 = (exp: Exp | Program): Result<string> =>
    isProgram(exp) ? bind(mapResult(unparseL21, exp.exps), (exps: string[]) => makeOk(`(L21 ${exps.join(" ")})`)) :
    isBoolExp(exp) ? makeOk(exp.val ? "#t" : "#f") :
    isNumExp(exp) ? makeOk(exp.val.toString()) :
    isVarRef(exp) ? makeOk(exp.var) :
    isPrimOp(exp) ? makeOk(exp.op) :
    isDefineExp(exp) ? bind(unparseL21(exp.val), (val: string) => makeOk(`(define ${exp.var.var} ${val})`)) :
    isProcExp(exp) ? bind(mapResult(unparseL21, exp.body), (body: string[]) => makeOk(`(lambda (${map(v => v.var, exp.args).join(" ")}) ${body.join(" ")})`)) :
    isForExp(exp) ? safe3((start: string, end: string, body: string) => makeOk(`(for ${exp.var.var} ${start} ${end} ${body})`))
                    (unparseL21(exp.start), unparseL21(exp.end), unparseL21(exp.body)) :
    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(if ${test} ${then} ${alt})`))
                    (unparseL21(exp.test), unparseL21(exp.then), unparseL21(exp.alt)) :
    isAppExp(exp) ? safe2((rator: string, rands: string[]) => makeOk(`(${rator} ${rands.join(" ")})`))
                        (unparseL21(exp.rator), mapResult(unparseL21, exp.rands)) :
    makeFailure(`Unknown expression: ${exp}`);
