import * as dgram from "dgram"
import { OPERATION_CODE, RESPONSE_CODE } from "./message/constants"

import { DNSMessageHeader } from "./message/header"
import { DNSMessageQuestion } from "./message/question"
import { DNSMessageAnswer } from "./message/answer"
import type { DNSMessageAnswerDecoded, DNSMessageHeaderDecoded, DNSMessageQuestionDecoded } from "./message/types"

const resolverAddress = process.argv[3].split(":")
const resolverIp = resolverAddress[0]
const resolverPort = parseInt(resolverAddress[1])

const udpSocket = dgram.createSocket("udp4")
udpSocket.bind(2053, "127.0.0.1")

async function forwardQuestion(header: DNSMessageHeaderDecoded, question: DNSMessageQuestionDecoded): Promise<
    { header: DNSMessageHeaderDecoded, questions: DNSMessageQuestionDecoded[], answers: DNSMessageAnswerDecoded[] } | null
> {
    return new Promise((resolve, reject) => {
        const forwarderSocket = dgram.createSocket("udp4")

        forwarderSocket.on('error', (err) => {
            if (err) {
                forwarderSocket.close()
                reject()
            }
        })

        const encodedHeader = DNSMessageHeader.encode({
            id: header.id,
            isResponse: false,
            operationCode: OPERATION_CODE.QUERY,
            isAuthoritativeAnswer: false,
            hasTrucation: false,
            hasRecursionRequired: true,
            recursionIsAvailable: false,
            reservedZone: 0,
            responseCode: RESPONSE_CODE.NO_ERROR,
            questionCount: 1,
            answerRecordCount: 0,
            authorityRecordCount: 0,
            additionalRecordCount: 0,
        })
        const encodedQuestion = DNSMessageQuestion.encode([question])

        const query = Buffer.concat([encodedHeader, encodedQuestion])

        forwarderSocket.send(query, resolverPort, resolverIp, (err) => {
            if (err) {
                forwarderSocket.close()
                reject()
            }
        })

        forwarderSocket.on('message', (data, remoteAddr) => {
            const header = DNSMessageHeader.decode(data)
            if (header === null) {
                return null
            }

            const questions = DNSMessageQuestion.decode(data, header.questionCount)

            if (questions === null) {
                return null
            }

            const answers = DNSMessageAnswer.decode(data, header.questionCount, questions.offsetEnd)
            resolve({
                header,
                questions: questions.questions,
                answers
            })
        })
    })
}

udpSocket.on("message", async (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
    try {

        // Decode incoming packet

        const decodedHeader = DNSMessageHeader.decode(data);
        if (decodedHeader === null) {
            return null;
        }

        const decodedQuestions = DNSMessageQuestion.decode(data, decodedHeader.questionCount);
        if (decodedQuestions === null) {
            return null;
        }

        // Forward request

        const responses = await Promise.all(decodedQuestions.questions.map(question => forwardQuestion(decodedHeader, question)))

        const answers: DNSMessageAnswerDecoded[] = []

        for (const response of responses) {
            if (response === null || response.answers[0] === undefined) {
                return null
            }
            answers.push(response.answers[0])
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
        const encodedQuestions = DNSMessageQuestion.encode(decodedQuestions.questions)

        const encodedAnswers = DNSMessageAnswer.encode(answers)

        const response = Buffer.concat([encodedHeader, encodedQuestions, encodedAnswers])

        udpSocket.send(response, remoteAddr.port, remoteAddr.address)

    } catch (e) {
        console.log(`Error sending data: ${e}`)
    }
})
