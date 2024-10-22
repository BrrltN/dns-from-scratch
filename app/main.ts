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

        const decodedQuestions = DNSMessageQuestion.decode(data, decodedHeader.questionCount)
        if (decodedQuestions === null) {
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
            questionCount: decodedHeader.questionCount,
            answerRecordCount: decodedHeader.questionCount,
            authorityRecordCount: 0,
            additionalRecordCount: 0,
        })

        const encodedQuestions = DNSMessageQuestion.encode(decodedQuestions)

        const encodedAnswers = DNSMessageAnswer.encode(
            decodedQuestions.map(dq => ({ ...dq, timeToLeave: 60, ipAddress: [8, 8, 8, 8] }))
        )

        const response = Buffer.concat([encodedHeader, encodedQuestions, encodedAnswers])

        udpSocket.send(response, remoteAddr.port, remoteAddr.address)
    } catch (e) {
        console.log(`Error sending data: ${e}`)
    }
})
