export const calcQuiz = (answers: number[], correctAnswerIndex: number[]) => {
    return answers.every((answer) => {
        correctAnswerIndex.includes(answer);
    });
};
