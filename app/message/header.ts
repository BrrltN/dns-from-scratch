import { OPERATION_CODE, RESPONSE_CODE } from "./constants"
import type { DNSMessageHeaderDecoded, OPERATION_CODE_VALUES, RESPONSE_CODE_VALUES } from "./types"



export class DNSMessageHeader {
    static #isAvailableOperationCode(operationCode: number): operationCode is OPERATION_CODE_VALUES {
        for (const operationCodeValue of Object.values(OPERATION_CODE)) {
            if (operationCode === operationCodeValue) {
                return true
            }
        }
        return false
    }

    static #isAvailableResponseCode(responseCode: number): responseCode is RESPONSE_CODE_VALUES {
        for (const responseCodeValue of Object.values(RESPONSE_CODE)) {
            if (responseCode === responseCodeValue) {
                return true
            }
        }
        return false
    }

    static decode(buffer: Buffer): DNSMessageHeaderDecoded | null {

        const packetId = buffer.readUInt16BE(0)
        const questionCount = buffer.readUInt16BE(4)
        const answerCount = buffer.readUInt16BE(6)
        const authorityCount = buffer.readUInt16BE(8)
        const additionalRecordCount = buffer.readUInt16BE(10)

        const flag = buffer.subarray(2, 4).readUInt16BE()

        const isResponseMask = 0b1000_0000_0000_0000
        const isResponse = (flag & isResponseMask) >> 15

        const operationCodeMask = 0b0111_1000_0000_0000
        const operationCode = (flag & operationCodeMask) >> 11

        const isAuthoritativeAnswerMask = 0b0000_0100_0000_0000
        const isAuthoritativeAnswer = (flag & isAuthoritativeAnswerMask) >> 10

        const hasTrucationMask = 0b0000_0010_0000_0000
        const hasTrucation = (flag & hasTrucationMask) >> 9

        const hasRecursionRequiredMask = 0b0000_0001_0000_0000
        const hasRecursionRequired = (flag & hasRecursionRequiredMask) >> 8

        const recursionIsAvailableMask = 0b0000_0000_1000_0000
        const recursionIsAvailable = (flag & recursionIsAvailableMask) >> 7

        const reservedZoneMask = 0b0000_0000_0111_0000
        const reservedZone = (flag & reservedZoneMask) >> 4

        const responseCodeMask = 0b0000_0000_0000_1111
        const responseCode = flag & responseCodeMask

        const isAvailableOperationCode = this.#isAvailableOperationCode(operationCode)
        if (!isAvailableOperationCode) {
            return null
        }

        const isAvailableResponseCode = this.#isAvailableResponseCode(responseCode)
        if (!isAvailableResponseCode) {
            return null
        }

        const isAvailableReservedZone = reservedZone === 0
        if (!isAvailableReservedZone) {
            return null
        }


        const decodedHeader: DNSMessageHeaderDecoded = {
            id: packetId,
            isResponse: isResponse === 1,
            operationCode: operationCode,
            isAuthoritativeAnswer: isAuthoritativeAnswer === 1,
            hasTrucation: hasTrucation === 1,
            hasRecursionRequired: hasRecursionRequired === 1,
            recursionIsAvailable: recursionIsAvailable === 1,
            reservedZone: reservedZone,
            responseCode: responseCode,
            questionCount: questionCount,
            answerRecordCount: answerCount,
            authorityRecordCount: authorityCount,
            additionalRecordCount: additionalRecordCount,
        }

        return decodedHeader
    }
    static encode(decodedHeader: DNSMessageHeaderDecoded): Buffer {
        // id:                    16 bits

        // isResponse:            1 bit
        // operationCode:         4 bits
        // isAuthoritativeAnswer: 1 bit
        // hasTrucation:          1 bit
        // hasRecursionRequired:  1 bit
        // recursionIsAvailable:  1 bit
        // reservedZone:          3 bits
        // responseCode:          4 bits

        // questionCount:         16 bits
        // answerRecordCount:     16 bits
        // authorityRecordCount:  16 bits
        // additionalRecordCount: 16 bits
        // Total:                 12 octets

        const isResponse = +decodedHeader.isResponse << 15
        const operationCode = decodedHeader.operationCode << 11
        const isAuthoritativeAnswer = +decodedHeader.isAuthoritativeAnswer << 10
        const hasTrucation = +decodedHeader.hasTrucation << 9
        const hasRecursionRequired = +decodedHeader.hasRecursionRequired << 8
        const recursionIsAvailable = +decodedHeader.recursionIsAvailable << 7
        const reservedZone = decodedHeader.reservedZone << 4
        const responseCode = decodedHeader.responseCode << 0

        const flag = isResponse
            | operationCode
            | isAuthoritativeAnswer
            | hasTrucation
            | hasRecursionRequired
            | recursionIsAvailable
            | reservedZone
            | responseCode

        const buffer = Buffer.alloc(12)

        buffer.writeInt16BE(decodedHeader.id)
        buffer.writeInt16BE(flag, 2)
        buffer.writeInt16BE(decodedHeader.questionCount, 4)
        buffer.writeInt16BE(decodedHeader.answerRecordCount, 6)
        buffer.writeInt16BE(decodedHeader.authorityRecordCount, 8)
        buffer.writeInt16BE(decodedHeader.additionalRecordCount, 10)

        return buffer
    }
}
