import { OPERATION_CODE, RESPONSE_CODE, QUESTION_CLASS, QUESTION_TYPE } from "./const"

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

export type DNSMessageQuestionDecoded = {
    labels: string[],
    type: typeof QUESTION_TYPE[keyof typeof QUESTION_TYPE],
    class: typeof QUESTION_CLASS[keyof typeof QUESTION_CLASS],
}