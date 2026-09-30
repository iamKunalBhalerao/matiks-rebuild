import { OperationSign } from "@repo/db";
import type { Questions } from "../types/types";

export const generateQuestions = (): Questions[] => {
  const questions: Questions[] = [];
  const operation = ["ADD", "SUB", "MUL", "DIV"];

  for (let i = 0; i <= 60; i++) {
    const randomOperation = operation[
      Math.floor(Math.random() * operation.length)
    ] as OperationSign;

    const randomOperant1 = Math.floor(Math.random() * 101);
    const randomOperant2 = Math.floor(Math.random() * 101);

    let sysAnswer;

    if (randomOperation === "ADD") sysAnswer = randomOperant1 + randomOperant2;
    else if (randomOperation === "SUB")
      sysAnswer = Math.floor(randomOperant1 - randomOperant2);
    else if (randomOperation === "MUL")
      sysAnswer = randomOperant1 * randomOperant2;
    else sysAnswer = Math.floor(randomOperant1 / randomOperant2);

    questions.push({
      operant2: randomOperant1,
      operant1: randomOperant2,
      operation: randomOperation,
      sysAnswer: sysAnswer,
    });
  }

  return questions;
};
