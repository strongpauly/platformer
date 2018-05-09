import { intersects } from "./intersects";

it('can call function', () => {
 expect(intersects({x: 1, y: 1, width: 10, height: 10}, {x: 1, y: 1, width: 10, height: 10})).not.toBeUndefined();
});

it('will return true for same shape', () => {
    const shapeA = {x: 1, y: 1, width: 10, height: 10}
    expect(intersects(shapeA, shapeA)).toBeTruthy();
});
   