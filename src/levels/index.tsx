import { ILevelMap } from "../model/ILevel";
import one from "./1";
import two from "./2";
import three from "./3";
import doorTest from "./doorTest";
import enemyTest from "./enemyTest";
import gunTest from "./gunTest";
import hitTest from "./hitTest";
import platformTest from "./platformTest";
import platformTest2 from "./platformTest2";
import playerTest from "./playerTest";

export const levels: ILevelMap = {
  1: one,
  2: two,
  3: three,
  // Test levels
  doorTest,
  enemyTest,
  gunTest,
  hitTest,
  platformTest,
  platformTest2,
  playerTest
};
