import { OPERATION_CODE, RESPONSE_CODE, QUESTION_CLASS, QUESTION_TYPE } from "./constants"

export type OPERATION_CODE_VALUES = typeof OPERATION_CODE[keyof typeof OPERATION_CODE]
export type RESPONSE_CODE_VALUES = typeof RESPONSE_CODE[keyof typeof RESPONSE_CODE]

export type DNSMessageHeaderDecoded = {
    id: number,
    isResponse: boolean,
    operationCode: OPERATION_CODE_VALUES,
    isAuthoritativeAnswer: boolean,
    hasTrucation: boolean,
    hasRecursionRequired: boolean,
    recursionIsAvailable: boolean,
    reservedZone: 0,
    responseCode: RESPONSE_CODE_VALUES,
    questionCount: number,
    answerRecordCount: number,
    authorityRecordCount: number,
    additionalRecordCount: number,
}

export type QuestionAnswerType = typeof QUESTION_TYPE[keyof typeof QUESTION_TYPE]
export type QuestionAnswerClass = typeof QUESTION_CLASS[keyof typeof QUESTION_CLASS]

export type DNSMessageQuestionDecoded = {
    label: string,
    type: QuestionAnswerType,
    class: QuestionAnswerClass,
}

export type DNSMessageAnswerDecoded = DNSMessageQuestionDecoded & {
    timeToLeave: number,
    ipAddress: [number, number, number, number]
}