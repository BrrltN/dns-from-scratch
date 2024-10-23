import { OPERATION_CODE, DNS_CLASS, DNS_TYPE, RESPONSE_CODE } from "./constants"
import type { Answer, Header, Question, DNSType, DNSClass } from "./types"

type QueryParams = {
    id: Header['id'],
    questions: Question["label"][] | Question[],
    operationCode?: Header['operationCode'],
    hasRecursionRequired?: Header['hasRecursionRequired'],
}

type ResponseParams = QueryParams & {
    responseCode: Header['responseCode'],
    answers: Answer[]
}

export class DNSMessageEncoder {

    static #encodeHeader(header: Header): Buffer {
        const isResponse = +header.isResponse << 15
        const operationCode = header.operationCode << 11
        const isAuthoritativeAnswer = +header.isAuthoritativeAnswer << 10
        const hasTrucation = +header.hasTrucation << 9
        const hasRecursionRequired = +header.hasRecursionRequired << 8
        const recursionIsAvailable = +header.recursionIsAvailable << 7
        const reservedZone = header.reservedZone << 4
        const responseCode = header.responseCode << 0

        const flag = isResponse
            | operationCode
            | isAuthoritativeAnswer
            | hasTrucation
            | hasRecursionRequired
            | recursionIsAvailable
            | reservedZone
            | responseCode

        const buffer = Buffer.alloc(12)

        buffer.writeInt16BE(header.id)
        buffer.writeInt16BE(flag, 2)
        buffer.writeInt16BE(header.questionCount, 4)
        buffer.writeInt16BE(header.answerRecordCount, 6)
        buffer.writeInt16BE(header.authorityRecordCount, 8)
        buffer.writeInt16BE(header.additionalRecordCount, 10)

        return buffer
    }

    static #encodeLabels(label: string): Buffer {
        const chunks: (Buffer | Uint8Array)[] = []

        const domains = label.split(".")

        for (const domain of domains) {
            const domainBuffer = Buffer.from(domain)
            chunks.push(new Uint8Array([domainBuffer.byteLength]), domainBuffer)
        }

        const endSection = new Uint8Array([0])
        chunks.push(endSection)

        const labelSequence = Buffer.concat(chunks)

        return labelSequence
    }

    static #encodeTypeClass(values: { type: DNSType, class: DNSClass }): Buffer {
        const typeClassSequence = Buffer.alloc(4)
        typeClassSequence.writeInt16BE(values.type)
        typeClassSequence.writeInt16BE(values.class, 2)
        return typeClassSequence
    }

    static #encodeQuestions(questions: Question[]): Buffer {
        const sections = []

        for (const question of questions) {
            const labelSequence = this.#encodeLabels(question.label)
            const typeClassSequence = this.#encodeTypeClass(question)
            sections.push(labelSequence, typeClassSequence)
        }

        const questionSection = Buffer.concat(sections)

        return questionSection
    }

    static #encodeAnswers(answers: Answer[]): Buffer {

        const sections = []

        for (const answer of answers) {
            const labelSequence = this.#encodeLabels(answer.label)
            const typeClassSequence = this.#encodeTypeClass(answer)

            const timeToLive = Buffer.alloc(4)
            timeToLive.writeInt32BE(answer.timeToLive)

            const data = Buffer.from(answer.ipAddress)

            const dataLength = Buffer.alloc(2)
            dataLength.writeInt16BE(data.byteLength)

            sections.push(labelSequence, typeClassSequence, timeToLive, dataLength, data)
        }

        const answerSection = Buffer.concat(sections)

        return answerSection
    }

    static #parsePartialQuestion(partialQuestion: QueryParams['questions']): Question[] {
        const questions = partialQuestion.map(question => {
            const isCompleteQuestion = typeof question !== "string"
            if (isCompleteQuestion) {
                return question
            }
            return {
                label: question,
                type: DNS_TYPE.HOST_ADDRESS,
                class: DNS_CLASS.INTERNET,
            }
        })
        return questions
    }

    static encodeQuery(queryParam: QueryParams): Buffer {
        const encodedHeader = this.#encodeHeader({
            id: queryParam.id,
            isResponse: false,
            operationCode: queryParam.operationCode ?? OPERATION_CODE.QUERY,
            isAuthoritativeAnswer: false,
            hasTrucation: false,
            hasRecursionRequired: queryParam.hasRecursionRequired ?? true,
            recursionIsAvailable: false,
            reservedZone: 0,
            responseCode: RESPONSE_CODE.NO_ERROR,
            questionCount: queryParam.questions.length,
            answerRecordCount: 0,
            authorityRecordCount: 0,
            additionalRecordCount: 0,
        })

        const questions = this.#parsePartialQuestion(queryParam.questions)
        const encodeQuestions = this.#encodeQuestions(questions)

        const query = Buffer.concat([encodedHeader, encodeQuestions])

        return query
    }

    static encodeResponse(responseParams: ResponseParams): Buffer {
        const encodedHeader = this.#encodeHeader({
            id: responseParams.id,
            isResponse: true,
            operationCode: responseParams.operationCode ?? OPERATION_CODE.QUERY,
            isAuthoritativeAnswer: false,
            hasTrucation: false,
            hasRecursionRequired: responseParams.hasRecursionRequired ?? true,
            recursionIsAvailable: false,
            reservedZone: 0,
            responseCode: responseParams.responseCode,
            questionCount: responseParams.questions.length,
            answerRecordCount: responseParams.answers.length,
            authorityRecordCount: 0,
            additionalRecordCount: 0,
        })

        const questions = this.#parsePartialQuestion(responseParams.questions)
        const encodeQuestions = this.#encodeQuestions(questions)

        const encodedAnswers = this.#encodeAnswers(responseParams.answers)

        const response = Buffer.concat([encodedHeader, encodeQuestions, encodedAnswers])

        return response
    }

    static encodeErrorResponse(id: Header['id']): Buffer {
        const encodedHeader = this.#encodeHeader({
            id: id,
            isResponse: true,
            operationCode: OPERATION_CODE.QUERY,
            isAuthoritativeAnswer: false,
            hasTrucation: false,
            hasRecursionRequired: false,
            recursionIsAvailable: false,
            reservedZone: 0,
            responseCode: RESPONSE_CODE.SERVER_FAIL,
            questionCount: 0,
            answerRecordCount: 0,
            authorityRecordCount: 0,
            additionalRecordCount: 0,
        })

        return encodedHeader
    }

}