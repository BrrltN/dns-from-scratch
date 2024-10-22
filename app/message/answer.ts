import { QA_CLASS, QA_TYPE } from "./constants"
import type { DNSMessageAnswerDecoded } from "./types"

import { decodeLabels, getLabelSequenceBuffer, getTypeClassSequenceBuffer, isAvailableClass, isAvailableType } from "./utils"

export class DNSMessageAnswer {

    static decode(data: Buffer, headerAnswerCount: number, offsetStart: number): DNSMessageAnswerDecoded[] {

        let currentOffset = offsetStart
        let questionCounter = 0

        const answers: DNSMessageAnswerDecoded[] = []

        while (questionCounter < headerAnswerCount) {
            const { name, endOffset } = decodeLabels(data, currentOffset)

            currentOffset = endOffset

            const typeQuestionSection = data.subarray(currentOffset, currentOffset + 2)
            const questionType = typeQuestionSection.readUInt16BE()
            currentOffset += 2

            const classQuestionSection = data.subarray(currentOffset, currentOffset + 2)
            const questionClass = classQuestionSection.readUInt16BE()
            currentOffset += 2

            const timeToLiveSection = data.subarray(currentOffset, currentOffset + 4)
            const timeToLive = timeToLiveSection.readUInt32BE()
            currentOffset += 4

            const dataLengthSection = data.subarray(currentOffset, currentOffset + 2)
            const dataLength = dataLengthSection.readUInt16BE()
            currentOffset += 2

            const dataSection = data.subarray(currentOffset, currentOffset + dataLength)
            currentOffset += dataLength


            const answer: DNSMessageAnswerDecoded = {
                label: name,
                type: isAvailableType(questionType) ? questionType : QA_TYPE.HOST_ADDRESS,
                class: isAvailableClass(questionClass) ? questionClass : QA_CLASS.INTERNET,
                timeToLive: timeToLive,
                ipAddress: [dataSection[0], dataSection[1], dataSection[2], dataSection[3]]
            }

            answers.push(answer)

            questionCounter++
        }

        return answers
    }

    static encode(answers: DNSMessageAnswerDecoded[]): Buffer {

        const sections = []

        for (const answer of answers) {
            const labelSequence = getLabelSequenceBuffer(answer.label)
            const typeClassSequence = getTypeClassSequenceBuffer({
                type: answer.type,
                class: answer.class,
            })

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
}
