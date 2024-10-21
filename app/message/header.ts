import type { DNSMessageHeaderDecoded } from "./types"

export class DNSMessageHeader {
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

        const buffer = Buffer.alloc(12)

        const isResponse = +decodedHeader.isResponse << 15
        const operationCode = decodedHeader.operationCode << 11
        const isAuthoritativeAnswer = +decodedHeader.isAuthoritativeAnswer << 10
        const hasRecursionRequired = +decodedHeader.hasRecursionRequired << 9
        const recursionIsAvailable = +decodedHeader.recursionIsAvailable << 8
        const reservedZone = decodedHeader.reservedZone << 5
        const responseCode = decodedHeader.responseCode << 4

        const flag = isResponse
            | operationCode
            | isAuthoritativeAnswer
            | hasRecursionRequired
            | recursionIsAvailable
            | reservedZone
            | responseCode

        buffer.writeInt16BE(decodedHeader.id)
        buffer.writeInt16BE(flag, 2)
        buffer.writeInt16BE(decodedHeader.questionCount, 4)
        buffer.writeInt16BE(decodedHeader.answerRecordCount, 6)
        buffer.writeInt16BE(decodedHeader.authorityRecordCount, 8)
        buffer.writeInt16BE(decodedHeader.additionalRecordCount, 10)

        return buffer
    }
}
