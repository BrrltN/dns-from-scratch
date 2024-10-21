import * as dgram from "dgram"
import { OPERATION_CODE, RESPONSE_CODE, QUESTION_CLASS, QUESTION_TYPE } from "./message/constants"

import { DNSMessageHeader } from "./message/header"
import { DNSMessageQuestion } from "./message/question"
import { DNSMessageAnswer } from "./message/answer"

const udpSocket: dgram.Socket = dgram.createSocket("udp4")
udpSocket.bind(2053, "127.0.0.1")


udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
    try {
        const queryDomains = ["codecrafters.io"]

        const encodedHeader = DNSMessageHeader.encode({
            id: 1234,
            isResponse: true,
            operationCode: OPERATION_CODE.QUERY,
            isAuthoritativeAnswer: false,
            hasTrucation: false,
            hasRecursionRequired: false,
            recursionIsAvailable: false,
            reservedZone: 0,
            responseCode: RESPONSE_CODE.NO_ERROR,
            questionCount: queryDomains.length,
            answerRecordCount: queryDomains.length,
            authorityRecordCount: 0,
            additionalRecordCount: 0,
        })

        const encodedQuestion = DNSMessageQuestion.encode({
            labels: queryDomains,
            type: QUESTION_TYPE.HOST_ADDRESS,
            class: QUESTION_CLASS.INTERNET,
        })

        const encodedAnswer = DNSMessageAnswer.encode({
            labels: queryDomains,
            type: QUESTION_TYPE.HOST_ADDRESS,
            class: QUESTION_CLASS.INTERNET,
            timeToLeave: 60,
            ipAddress: [8, 8, 8, 8],
        })

        const response = Buffer.concat([encodedHeader, encodedQuestion, encodedAnswer])

        udpSocket.send(response.toString(), remoteAddr.port, remoteAddr.address)
    } catch (e) {
        console.log(`Error sending data: ${e}`)
    }
})
