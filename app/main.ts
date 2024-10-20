import * as dgram from "dgram";


const udpSocket: dgram.Socket = dgram.createSocket("udp4")
udpSocket.bind(2053, "127.0.0.1")


udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
    try {


        const OPERATION_CODE = {
            QUERY: 0,
            IQUERY: 1,
            STATUS: 2,
        }

        const RESPONSE_CODE = {
            NO_ERROR: 0,
            FORMAT_ERROR: 1,
            SERVER_FAIL: 2,
            NO_EXISTENT_DOMAIN: 3,
        }

        const headerDNSMessage = {
            id: 1234,                               // 16 bits | 2 octets
            // FLAG    | 2 octets
            isResponse: true,                       // 1 bit
            operationCode: OPERATION_CODE.QUERY,    // 4 bit
            isAuthoritativeAnswer: false,           // 1 bit
            hasTrucation: false,                    // 1 bit
            hasRecursionRequired: false,            // 1 bit
            recursionIsAvailable: false,            // 1 bit
            reservedZone: 0,                        // 3 bits
            responseCode: RESPONSE_CODE.NO_ERROR,   // 4 bits
            // -- FLAG
            questionCount: 0,                       // 16 bits | 2 octets
            answerRecordCount: 0,                   // 16 bits | 2 octets
            authorityRecordCount: 0,                // 16 bits | 2 octets
            additionalRecordCount: 0,               // 16 bits | 2 octets
        }

        const buffer = Buffer.alloc(12)

        const isResponse = +headerDNSMessage.isResponse << 15
        const operationCode = headerDNSMessage.operationCode << 11
        const isAuthoritativeAnswer = +headerDNSMessage.isAuthoritativeAnswer << 10
        const hasRecursionRequired = +headerDNSMessage.hasRecursionRequired << 9
        const recursionIsAvailable = +headerDNSMessage.recursionIsAvailable << 8
        const reservedZone = headerDNSMessage.reservedZone << 5
        const responseCode = headerDNSMessage.responseCode << 4

        const flag = isResponse
            | operationCode
            | isAuthoritativeAnswer
            | hasRecursionRequired
            | recursionIsAvailable
            | reservedZone
            | responseCode

        buffer.writeInt16BE(headerDNSMessage.id)
        buffer.writeInt16BE(flag, 2)
        buffer.writeInt16BE(headerDNSMessage.questionCount, 4)
        buffer.writeInt16BE(headerDNSMessage.answerRecordCount, 6)
        buffer.writeInt16BE(headerDNSMessage.authorityRecordCount, 8)
        buffer.writeInt16BE(headerDNSMessage.additionalRecordCount, 10)


        // const response = Buffer.from(buffer)
        udpSocket.send(buffer.toString(), remoteAddr.port, remoteAddr.address)
    } catch (e) {
        console.log(`Error sending data: ${e}`)
    }
})
