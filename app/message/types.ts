import { OPERATION_CODE, RESPONSE_CODE, DNS_CLASS, DNS_TYPE } from "./constants"

export type OPERATION_CODE_VALUES = typeof OPERATION_CODE[keyof typeof OPERATION_CODE]
export type RESPONSE_CODE_VALUES = typeof RESPONSE_CODE[keyof typeof RESPONSE_CODE]

export type Header = {
    id: number,
    isResponse: boolean,
    operationCode: OPERATION_CODE_VALUES,
    isAuthoritativeAnswer: boolean,
    hasTrucation: boolean,
    hasRecursionRequired: boolean,
    recursionIsAvailable: boolean,
    reservedZone: number,
    responseCode: RESPONSE_CODE_VALUES,
    questionCount: number,
    answerRecordCount: number,
    authorityRecordCount: number,
    additionalRecordCount: number,
}

export type DNSType = typeof DNS_TYPE[keyof typeof DNS_TYPE]
export type DNSClass = typeof DNS_CLASS[keyof typeof DNS_CLASS]

export type Question = {
    label: string,
    type: DNSType,
    class: DNSClass,
}

export type IpArray = [number, number, number, number]

export type Answer = Question & {
    timeToLive: number,
    ipAddress: IpArray
}