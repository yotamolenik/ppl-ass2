import { ForExp, AppExp, Exp, Program, makeAppExp, makeProcExp, makeNumExp, isForExp } from "./L21-ast";
import { Result, makeOk, makeFailure } from "../imp/result";
import { map, range } from "ramda";
import { isProgram, makeProgram, isExp } from "../imp/L2-ast";

/*
Purpose: convert a ForExp in L21 to an AppExp in L2
Signature: for2app(ForExp)
Type: [ForExp -> AppExp]
*/

// 
export const for2app = (exp: ForExp): AppExp =>{
    const arr = range(exp.start.val,exp.end.val);
    const appExpArr = arr.map((i)=>
                    makeAppExp(
                        makeProcExp([exp.loopVariable], [exp.body]),[makeNumExp(i)]));
    return makeAppExp(makeProcExp([], appExpArr),[]);
}


/*
Purpose: convert an L21 program to an L2 program
Signature: L21ToL2(Exp | Program)
Type: [Exp | Program -> Result<Exp | Program>]
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>{
    if (isProgram(exp)){
        const L2Arr = exp.exps.map((x) => 
        {
            if(isForExp(x))
                return for2app(x);
            return x;
        })
        if (L2Arr.filter((x) => !isExp(x)) != [] )
            return makeOk(makeProgram(L2Arr));
            else
            return makeFailure("L2Arr");
    }
    else{
        if(isForExp(exp)){
            return makeOk(for2app(exp));
        }
        return makeOk(exp)
    }
}
