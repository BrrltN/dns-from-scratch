import { OPERATION_CODE, RESPONSE_CODE, QUESTION_CLASS, QUESTION_TYPE } from "./constants"

export type DNSMessageHeaderDecoded = {
    id: number,
    isResponse: boolean,
    operationCode: typeof OPERATION_CODE[keyof typeof OPERATION_CODE],
    isAuthoritativeAnswer: boolean,
    hasTrucation: boolean,
    hasRecursionRequired: boolean,
    recursionIsAvailable: boolean,
    reservedZone: 0,
    responseCode: typeof RESPONSE_CODE[keyof typeof RESPONSE_CODE],
    questionCount: number,
    answerRecordCount: number,
    authorityRecordCount: number,
    additionalRecordCount: number,
}

export type QuestionAnswerType = typeof QUESTION_TYPE[keyof typeof QUESTION_TYPE]
export type QuestionAnswerClass = typeof QUESTION_CLASS[keyof typeof QUESTION_CLASS]

export type DNSMessageQuestionDecoded = {
    labels: string[],
    type: QuestionAnswerType,
    class: QuestionAnswerClass,
}

export type DNSMessageAnswerDecoded = {
    labels: string[],
    type: QuestionAnswerType,
    class: QuestionAnswerClass,
    timeToLeave: number,
    ipAddress: [number, number, number, number]
}