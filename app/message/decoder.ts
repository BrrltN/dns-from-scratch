import { OPERATION_CODE, DNS_CLASS, DNS_TYPE, RESPONSE_CODE } from "./constants"
import type { Header, Question, OPERATION_CODE_VALUES, RESPONSE_CODE_VALUES, DNSClass, DNSType, Answer } from "./types"


export class DNSMessageDecoder {
    #UDPPacket: Buffer
    #questionsEndOffset: number = 0

    header: Header | null = null
    questions: Question[] | null = null
    answers: Answer[] | null = null

    constructor(udpPacket: Buffer) {
        this.#UDPPacket = udpPacket

        this.#decodeHeader()
        if (this.header === null) {
            return
        }


        this.#decodeQuestions()
        if (this.questions === null || this.#questionsEndOffset === 0) {
            return
        }

        this.#decodeAnswers()
    }

    #isAvailableOperationCode(operationCode: number): operationCode is OPERATION_CODE_VALUES {
        for (const operationCodeValue of Object.values(OPERATION_CODE)) {
            if (operationCode === operationCodeValue) {
                return true
            }
        }
        return false
    }

    #isAvailableResponseCode(responseCode: number): responseCode is RESPONSE_CODE_VALUES {
        for (const responseCodeValue of Object.values(RESPONSE_CODE)) {
            if (responseCode === responseCodeValue) {
                return true
            }
        }
        return false
    }

    #isAvailableType(QAType: number): QAType is DNSType {
        for (const QATypeValue of Object.values(DNS_TYPE)) {
            if (QAType === QATypeValue) {
                return true
            }
        }
        return false
    }

    #isAvailableClass(QAClass: number): QAClass is DNSClass {
        for (const QAClassValue of Object.values(DNS_CLASS)) {
            if (QAClass === QAClassValue) {
                return true
            }
        }
        return false
    }

    #decodeHeader(): void {
        const packetId = this.#UDPPacket.readUInt16BE(0)
        const questionCount = this.#UDPPacket.readUInt16BE(4)
        const answerCount = this.#UDPPacket.readUInt16BE(6)
        const authorityCount = this.#UDPPacket.readUInt16BE(8)
        const additionalRecordCount = this.#UDPPacket.readUInt16BE(10)

        const flag = this.#UDPPacket.subarray(2, 4).readUInt16BE()

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
        const isAvailableResponseCode = this.#isAvailableResponseCode(responseCode)

        if (!isAvailableOperationCode || !isAvailableResponseCode) {
            return
        }

        this.header = {
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
    }

    #decodeLabels(startOffset: number): { domain: string, endOffset: number } {
        const labels: string[] = []

        let offset = startOffset
        let isPointerFollow = false

        while (true) {

            const currentByte = this.#UDPPacket[offset]

            const isCompression = (currentByte & 0b1100_0000) !== 0

            if (isCompression) {
                isPointerFollow = true

                const compressBytes = this.#UDPPacket.subarray(offset, offset + 2)
                const compressBytesValue = compressBytes.readUInt16BE()
                const offsetReference = compressBytesValue & 0b0011_1111_1111_1111

                const result = this.#decodeLabels(offsetReference)
                labels.push(result.domain)
                offset += 2
                break
            }

            const isLabelEnd = currentByte === 0
            if (isLabelEnd) {
                offset++
                break
            }

            const labelStartOffSet = offset + 1
            const labelEndOffset = labelStartOffSet + currentByte

            labels.push(
                this.#UDPPacket.subarray(labelStartOffSet, labelEndOffset).toString()
            )

            offset = labelEndOffset
        }

        return { domain: labels.join("."), endOffset: offset }
    }

    #decodeTypeClass(startOffset: number): { type: DNSType, class: DNSClass } {
        const startType = startOffset
        const endType = startType + 2
        const typeQuestionSection = this.#UDPPacket.subarray(startType, endType)
        const questionType = typeQuestionSection.readUInt16BE()

        const startClass = endType
        const endClass = startClass + 2
        const classQuestionSection = this.#UDPPacket.subarray(startClass, endClass)
        const questionClass = classQuestionSection.readUInt16BE()

        return {
            type: this.#isAvailableType(questionType) ? questionType : DNS_TYPE.HOST_ADDRESS,
            class: this.#isAvailableClass(questionClass) ? questionClass : DNS_CLASS.INTERNET,
        }
    }

    #decodeQuestions(): void {
        if (this.header === null) {
            return
        }
        const HEADER_OFFSET = 12
        let currentOffset = HEADER_OFFSET
        let questionCounter = 0

        const labelSequences: Question[] = []

        while (questionCounter < this.header.questionCount) {

            const { domain, endOffset } = this.#decodeLabels(currentOffset)

            currentOffset = endOffset

            const { type, class: QAClass } = this.#decodeTypeClass(currentOffset)

            currentOffset += 4

            const sequence: Question = {
                label: domain,
                type: type,
                class: QAClass,
            }

            labelSequences.push(sequence)

            questionCounter++
        }

        this.questions = labelSequences
        this.#questionsEndOffset = currentOffset
    }

    #decodeAnswers(): void {
        if (this.header === null || this.#questionsEndOffset === 0 || this.header.answerRecordCount === 0) {
            return
        }
        let currentOffset = this.#questionsEndOffset
        let questionCounter = 0

        const answers: Answer[] = []

        while (questionCounter < this.header.answerRecordCount) {
            const { domain, endOffset } = this.#decodeLabels(currentOffset)

            currentOffset = endOffset

            const { type, class: QAClass } = this.#decodeTypeClass(currentOffset)

            currentOffset += 4

            const timeToLiveSection = this.#UDPPacket.subarray(currentOffset, currentOffset + 4)
            const timeToLive = timeToLiveSection.readUInt32BE()
            currentOffset += 4

            const dataLengthSection = this.#UDPPacket.subarray(currentOffset, currentOffset + 2)
            const dataLength = dataLengthSection.readUInt16BE()
            currentOffset += 2

            const dataSection = this.#UDPPacket.subarray(currentOffset, currentOffset + dataLength)
            currentOffset += dataLength


            const answer: Answer = {
                label: domain,
                type: type,
                class: QAClass,
                timeToLive: timeToLive,
                ipAddress: [dataSection[0], dataSection[1], dataSection[2], dataSection[3]]
            }

            answers.push(answer)

            questionCounter++
        }

        this.answers = answers
    }
}
