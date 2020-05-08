
import { expect } from 'chai';
import { parseL21, parseL21Exp, Exp, Program, isIfExp, isAppExp, isProcExp } from '../L21-ast';
import { L21ToL2 } from '../q3';
import { unparseL21 } from '../L21-unparse';
import { Result, bind, isFailure, makeOk, makeFailure, isOkT, isOk } from '../../imp/result';
import { parse as p } from "../../imp/parser";

const L21toL2Result = (x: string): Result<Exp | Program> =>
    bind(bind(p(x), parseL21Exp), L21ToL2);

describe('Q3 Tests', () => {
    it('fails when given an AppExp for "end"', () => {
        expect(L21toL2Result(`(for i 1 (+ 2 2) (* i i))`)).to.satisfy(isFailure);

        expect(L21toL2Result(`(for i 1 (2) (* i i))`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for i (1) 2 (* i i))`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for )`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for i)`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for i 1)`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for i 1 2)`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for i 1 (* i i))`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for i 1 2 1`)).to.satisfy(isFailure);
    });

    it('fails when given a NumExp instead of a VarDecl loop variable', () => {
        expect(L21toL2Result(`(for 3 1 2 (* i i))`)).to.satisfy(isFailure);

        expect(L21toL2Result(`(for 1 i 1 (* i i))`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for 1 1 i (* i i))`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for (* i i) i 1 1)`)).to.satisfy(isFailure);
    });

    it('fails when there is more than one body expression', () => {
        expect(L21toL2Result(`(for i 1 2 (+ i i) (* i i))`)).to.satisfy(isFailure);
        expect(L21toL2Result(`(for i 1 1 2 3 4 (+ 2 2) (* i i))`)).to.satisfy(isFailure);
    });
    
    it('test 1', () => {
        expect(bind(bind(bind(p(`(for i 1 3 (* i i))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )`));

        expect(bind(bind(bind(p(`(for i 1 1 (* i i))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (* i i)) 1)) )`));
        expect(bind(bind(bind(p(`(for i 1 3 (* i i))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )`));
        expect(bind(bind(bind(p(`(for i 1 3 (* i i))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )`));
        expect(bind(bind(bind(p(`(for i 1 3 (if (= i 1) i 1))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (if (= i 1) i 1)) 1) ((lambda (i) (if (= i 1) i 1)) 2) ((lambda (i) (if (= i 1) i 1)) 3)) )`));
        expect(bind(bind(bind(p(`(for i 1 1 (if (= i 1) i 1))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (if (= i 1) i 1)) 1)) )`));
        expect(bind(bind(bind(p(`(for i 1 1 (lambda () (+ 3 1)))`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) (lambda () (+ 3 1))) 1)) )`));
        expect(bind(bind(bind(p(`(for i 1 1 1)`), parseL21Exp), L21ToL2), unparseL21)).to.deep.equal(makeOk(`((lambda () ((lambda (i) 1) 1)) )`));

        expect(bind(bind(bind(p(`(for i 3 0 (* i i))`), parseL21Exp), L21ToL2), unparseL21)).to.satisfy(isFailure);
        expect(bind(bind(bind(p(`(for i 1 0 (* i i))`), parseL21Exp), L21ToL2), unparseL21)).to.satisfy(isFailure);

    });

    it('test 2', () => {
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (* i i))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) (* i i)) 1) ((lambda (i) (* i i)) 2) ((lambda (i) (* i i)) 3)) )))`));
        
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (lambda (x) x x))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) (lambda (x) x x)) 1) ((lambda (i) (lambda (x) x x)) 2) ((lambda (i) (lambda (x) x x)) 3)) )))`));
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (> (+ x x) (* x x)))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) (> (+ x x) (* x x))) 1) ((lambda (i) (> (+ x x) (* x x))) 2) ((lambda (i) (> (+ x x) (* x x))) 3)) )))`));
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (lambda () 1))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) (lambda () 1)) 1) ((lambda (i) (lambda () 1)) 2) ((lambda (i) (lambda () 1)) 3)) )))`));
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (not #t))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) (not #t)) 1) ((lambda (i) (not #t)) 2) ((lambda (i) (not #t)) 3)) )))`));
        
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (number? 1))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) (number? 1)) 1) ((lambda (i) (number? 1)) 2) ((lambda (i) (number? 1)) 3)) )))`));
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (boolean? 0))))`), L21ToL2), unparseL21)).to.deep.equal(makeOk(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 ((lambda () ((lambda (i) (boolean? 0)) 1) ((lambda (i) (boolean? 0)) 2) ((lambda (i) (boolean? 0)) 3)) )))`));
        
        
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 3 (lambda x x))))`), L21ToL2), unparseL21)).to.satisfy(isFailure);
        expect(bind(bind(parseL21(`(L21 ((lambda (x) (* x x)) (+ 5 4)) (if (> y 6) 8 (for i 1 0 (lambda (x) x x))))`), L21ToL2), unparseL21)).to.satisfy(isFailure);
        
    });

    it('parses applications', () => {
        expect(bind(p("(> x 1)"), parseL21Exp)).to.satisfy(isOkT(isAppExp));
        expect(bind(p("(> (+ x x) (* x x))"), parseL21Exp)).to.satisfy(isOkT(isAppExp));
    });

    it('parses "if" expressions', () => {
        expect(bind(p("(if #t 1 2)"), parseL21Exp)).to.satisfy(isOkT(isIfExp));
        expect(bind(p("(if (< x 2) x 2)"), parseL21Exp)).to.satisfy(isOkT(isIfExp));

        expect(bind(p("(number? x y)"), parseL21Exp)).to.satisfy(isOkT(isAppExp));
        
    });

    it('parses procedures', () => {
        expect(bind(p("(lambda () 1)"), parseL21Exp)).to.satisfy(isOkT(isProcExp));
        expect(bind(p("(lambda (x) x x)"), parseL21Exp)).to.satisfy(isOkT(isProcExp));
    });
});