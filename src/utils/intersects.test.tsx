import { intersects } from "./intersects";

it('can call function', () => {
 expect(intersects({x: 1, y: 1, width: 10, height: 10}, {x: 1, y: 1, width: 10, height: 10})).not.toBeUndefined();
});

it('will return true for same shape', () => {
    const shapeA = {x: 1, y: 1, width: 10, height: 10}
    expect(intersects(shapeA, shapeA)).toBeTruthy();
});

it('will return true for shapes that overlap', () => {
    const shapeA = {x: 10, y: 0, width: 10, height: 16};
    const shapeB = {x: 5, y: 15, width: 10, height: 10};
    expect(intersects(shapeA, shapeB)).toBeTruthy();
});
   
it('will return false for shapes that don\'t overlap', () => {
    const shapeA = {x: 10, y: 0, width: 10, height: 15};
    const shapeB = {x: 5, y: 15, width: 10, height: 10};
    expect(intersects(shapeA, shapeB)).toBeFalsy();
});