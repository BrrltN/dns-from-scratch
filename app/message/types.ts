import { OPERATION_CODE, RESPONSE_CODE, QA_CLASS, QA_TYPE } from "./constants"

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

export type QAType = typeof QA_TYPE[keyof typeof QA_TYPE]
export type QAClass = typeof QA_CLASS[keyof typeof QA_CLASS]

export type DNSMessageQuestionDecoded = {
    label: string,
    type: QAType,
    class: QAClass,
}

export type IpArray = [number, number, number, number]

export type DNSMessageAnswerDecoded = DNSMessageQuestionDecoded & {
    timeToLive: number,
    ipAddress: IpArray
}