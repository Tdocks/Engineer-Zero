import type { CodingLessonPackage } from "../coding-lesson-package";
import { codingLessonsDay1 } from "./day1";
import { codingLessonsDay2 } from "./day2";
import { codingLessonsDay3 } from "./day3";
import { codingLessonsDay4 } from "./day4";

export const codingLessonPackages: CodingLessonPackage[] = [
  ...codingLessonsDay1,
  ...codingLessonsDay2,
  ...codingLessonsDay3,
  ...codingLessonsDay4,
];

export {
  codingLessonsDay1,
  codingLessonsDay2,
  codingLessonsDay3,
  codingLessonsDay4,
};
