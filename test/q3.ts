import { ForExp, AppExp, Exp, Program, makeAppExp, makeProcExp, makeNumExp } from "./L21-ast";
import { Result } from "../imp/result";
import { map, range } from "ramda";

/*
Purpose: @TODO
Signature: @TODO
Type: @TODO
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
Purpose: @TODO
Signature: @TODO
Type: @TODO
*/
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
    @TODO