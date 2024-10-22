import * as dgram from "dgram"
import { RESPONSE_CODE } from "./message/constants"

import { DNSMessageHeader } from "./message/header"
import { DNSMessageQuestion } from "./message/question"
import { DNSMessageAnswer } from "./message/answer"

const udpSocket: dgram.Socket = dgram.createSocket("udp4")
udpSocket.bind(2053, "127.0.0.1")


udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
    try {
        const decodedHeader = DNSMessageHeader.decode(data)
        if (decodedHeader === null) {
            return null
        }

        const decodedQuestion = DNSMessageQuestion.decode(data)
        if (decodedQuestion === null) {
            return null
        }

        const encodedHeader = DNSMessageHeader.encode({
            id: decodedHeader.id,
            isResponse: true,
            operationCode: decodedHeader.operationCode,
            isAuthoritativeAnswer: false,
            hasTrucation: false,
            hasRecursionRequired: decodedHeader.hasRecursionRequired,
            recursionIsAvailable: false,
            reservedZone: 0,
            responseCode: decodedHeader.operationCode === RESPONSE_CODE.NO_ERROR
                ? RESPONSE_CODE.NO_ERROR
                : RESPONSE_CODE.NOT_IMPLEMENTED,
            questionCount: 1,
            answerRecordCount: 1,
            authorityRecordCount: 0,
            additionalRecordCount: 0,
        })

        const encodedQuestion = DNSMessageQuestion.encode({
            label: decodedQuestion.label,
            type: decodedQuestion.type,
            class: decodedQuestion.class,
        })

        const encodedAnswer = DNSMessageAnswer.encode({
            label: decodedQuestion.label,
            type: decodedQuestion.type,
            class: decodedQuestion.class,
            timeToLeave: 60,
            ipAddress: [8, 8, 8, 8],
        })

        const response = Buffer.concat([encodedHeader, encodedQuestion, encodedAnswer])

        udpSocket.send(response, remoteAddr.port, remoteAddr.address)
    } catch (e) {
        console.log(`Error sending data: ${e}`)
    }
})
