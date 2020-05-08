import { isProgram, makeProgram, isExp, isCExp, isDefineExp,
         makeDefineExp, isAtomicExp, isIfExp, makeIfExp, isAppExp,
         isProcExp ,ForExp, AppExp, Exp, CExp, Program, makeAppExp,
         makeProcExp, makeNumExp, isForExp } from "./L21-ast";
import { Result, makeOk, makeFailure } from "../imp/result";
import { map, range } from "ramda";

/*
Purpose: convert a ForExp in L21 to an AppExp in L2
Signature: for2app(ForExp)
Type: [ForExp -> AppExp]
*/

// 
export const for2app = (exp: ForExp): AppExp =>{
    const arr = range(exp.start.val,exp.end.val+1);
    const appExpArr = arr.map((i)=>
                    makeAppExp(
                        makeProcExp([exp.var], [exp.body]),[makeNumExp(i)]));
    return makeAppExp(makeProcExp([], appExpArr),[]);
}


/*
Purpose: convert an L21 program to an L2 program
Signature: L21ToL2(Exp | Program)
Type: [Exp | Program -> Result<Exp | Program>]
*/


export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
    isExp(exp) ? makeOk(L21ToL2Exp(exp)) :
    isProgram(exp) ? makeOk(makeProgram(map(L21ToL2Exp, exp.exps))) :
    makeOk(exp);

/*
Purpose: convert an L21 Exp to an L2 Exp
Signature: L21ToL2Exp(Exp)
Type: [Exp -> Exp]
*/
const L21ToL2Exp = (exp: Exp): Exp =>
    isCExp(exp) ? L21ToL2CExp(exp) :
    isDefineExp(exp) ? makeDefineExp(exp.var, L21ToL2CExp(exp.val)) :
    exp;
/*
Purpose: convert an L21 CExp to an L2 CExp (Without ForExp)
Signature: L21ToL2CExp(CExp)
Type: [CExp -> CExp]
*/    
const L21ToL2CExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(L21ToL2CExp(exp.test),
                             L21ToL2CExp(exp.then),
                             L21ToL2CExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(L21ToL2CExp(exp.rator),
                            map(L21ToL2CExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(L21ToL2CExp, exp.body)) :
    isForExp(exp) ? L21ToL2CExp(for2app(exp)) :                             // for2app(exp) returns an AppExp. but if we have for inside for, after for2app(exp we have AppExp(for,operands))
    exp;

