import { createSocket } from "dgram"

import type { Answer, Header, Question } from "./message/types"

import { DNSMessageEncoder } from "./message/encoder"
import { DNSMessageDecoder } from "./message/decoder"
import { resolverIp, resolverPort } from "./server"
import { RESPONSE_CODE } from "./message/constants"


async function forwardQuery(header: Header, question: Question): Promise<DNSMessageDecoder> {
    return new Promise((resolve, reject) => {
        const forwarderSocket = createSocket("udp4")

        forwarderSocket.on('error', (err) => {
            forwarderSocket.close()
            reject()
        })

        const query = DNSMessageEncoder.encodeQuery({ id: header.id, questions: [question] })

        forwarderSocket.send(query, resolverPort, resolverIp, (err) => {
            if (err) {
                forwarderSocket.close()
                reject()
            }
        })

        forwarderSocket.on('message', (data) => {
            resolve(new DNSMessageDecoder(data))
            forwarderSocket.close()
        })
    })
}

export async function handleDNSRequest(data: Buffer): Promise<Buffer> {

    const query = new DNSMessageDecoder(data)

    if (query === null || query.header === null || query.questions === null) {
        if (query?.header?.id) {
            return DNSMessageEncoder.encodeErrorResponse(query.header.id)
        }
        const randomID = Math.floor(Math.random() * 65536)
        return DNSMessageEncoder.encodeErrorResponse(randomID)
    }

    const forwardedQueries = []
    for (const question of query.questions) {
        forwardedQueries.push(
            forwardQuery(query.header, question)
        )
    }

    const responses = await Promise.all(forwardedQueries)

    const answers: Answer[] = []

    for (const response of responses) {
        if (response.answers == null || response.answers[0] === undefined) {
            return DNSMessageEncoder.encodeErrorResponse(query.header.id)
        }
        answers.push(response.answers[0])
    }

    const response = DNSMessageEncoder.encodeResponse({
        id: query.header.id,
        questions: query.questions,
        operationCode: query.header.operationCode,
        hasRecursionRequired: query.header.hasRecursionRequired,
        responseCode: query.header.operationCode === RESPONSE_CODE.NO_ERROR
            ? RESPONSE_CODE.NO_ERROR
            : RESPONSE_CODE.NOT_IMPLEMENTED,
        answers: answers
    })

    return response
}