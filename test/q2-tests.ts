import fs from "fs";
import { expect } from 'chai';
import { evalParse, evalL3program } from '../imp/L3-eval';
import { Value } from "../imp/L3-value";
import { Result, bind, makeOk } from "../imp/result";
import { parseL3 } from "../imp/L3-ast";

const q2: string = fs.readFileSync('./test/q2.l3', { encoding: 'utf-8' });

const evalP = (x: string): Result<Value> =>
    bind(parseL3(x), evalL3program)

describe('Q2 Tests', () => {
    it('last-element tests', () => {
        expect(evalP(`(L3 ` + q2 + ` (last-element (list 1 2 3)))`)).to.deep.equal(makeOk(3));
        expect(evalP(`(L3 ` + q2 + ` (last-element (list 1)))`)).to.deep.equal(makeOk(1));
        expect(evalP(`(L3 ` + q2 + ` (last-element (list 5 7 -6 6 4 2 1)))`)).to.deep.equal(makeOk(1));

    });

    it('power tests', () => {
        expect(evalP(`(L3 ` + q2 + ` (power 2 4))`)).to.deep.equal(makeOk(16));
        expect(evalP(`(L3 ` + q2 + ` (power 0 3))`)).to.deep.equal(makeOk(0));
        expect(evalP(`(L3 ` + q2 + ` (power 3 0))`)).to.deep.equal(makeOk(1));
    });

    it('sum-lst-power tests', () => {
        expect(evalP(`(L3 ` + q2 + ` (sum-lst-power (list 1 2 3) 2))`)).to.deep.equal(makeOk(14));
        expect(evalP(`(L3 ` + q2 + ` (sum-lst-power (list) 2))`)).to.deep.equal(makeOk(0));
        expect(evalP(`(L3 ` + q2 + ` (sum-lst-power (list 1 1 4) 3))`)).to.deep.equal(makeOk(66));
    });

    it('num-from-digits tests', () => {
        expect(evalP(`(L3 ` + q2 + ` (num-from-digits (list 1 2 3)))`)).to.deep.equal(makeOk(123));
        expect(evalP(`(L3 ` + q2 + ` (num-from-digits (list)))`)).to.deep.equal(makeOk(0));
        expect(evalP(`(L3 ` + q2 + ` (num-from-digits (list 7 2 4 5 7 9)))`)).to.deep.equal(makeOk(724579));
    });

    it('is-narcissistic tests', () => {
        expect(evalP(`(L3 ` + q2 + ` (is-narcissistic (list 1 2 3)))`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3 ` + q2 + ` (is-narcissistic (list)))`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3 ` + q2 + ` (is-narcissistic (list 1)))`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3 ` + q2 + ` (is-narcissistic (list 1 5 3)))`)).to.deep.equal(makeOk(true));
        expect(evalP(`(L3 ` + q2 + ` (is-narcissistic (list 1 3 5)))`)).to.deep.equal(makeOk(false));
        expect(evalP(`(L3 ` + q2 + ` (is-narcissistic (list 3 7 1)))`)).to.deep.equal(makeOk(true));
    });
});
