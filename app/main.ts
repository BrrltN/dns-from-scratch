import * as dgram from "dgram"
import { OPERATION_CODE, RESPONSE_CODE, QUESTION_CLASS, QUESTION_TYPE } from "./message/const"

import { DNSMessageHeader } from "./message/header"
import { DNSMessageQuestion } from "./message/question"

const udpSocket: dgram.Socket = dgram.createSocket("udp4")
udpSocket.bind(2053, "127.0.0.1")


udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
    try {
        const questionNames = ["codecrafters.io"]

        const encodedQuestion = DNSMessageQuestion.encode({
            labels: questionNames,
            type: QUESTION_TYPE.HOST_ADDRESS,
            class: QUESTION_CLASS.INTERNET,
        })

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
            questionCount: questionNames.length,
            answerRecordCount: 0,
            authorityRecordCount: 0,
            additionalRecordCount: 0,
        })

        const response = Buffer.concat([encodedHeader, encodedQuestion])

        udpSocket.send(response.toString(), remoteAddr.port, remoteAddr.address)
    } catch (e) {
        console.log(`Error sending data: ${e}`)
    }
})
