import { QA_CLASS, QA_TYPE } from "./constants"
import type { DNSMessageQuestionDecoded } from "./types"

import { decodeLabels, getLabelSequenceBuffer, getTypeClassSequenceBuffer, isAvailableClass, isAvailableType } from "./utils"

export class DNSMessageQuestion {
    static decode(data: Buffer, headerQuestionCount: number): { questions: DNSMessageQuestionDecoded[], offsetEnd: number } | null {
        const HEADER_OFFSET = 12
        let currentOffset = HEADER_OFFSET
        let questionCounter = 0

        const labelSequences: DNSMessageQuestionDecoded[] = []

        while (questionCounter < headerQuestionCount) {
            const { name, endOffset } = decodeLabels(data, currentOffset)

            currentOffset = endOffset

            const typeQuestionSection = data.subarray(currentOffset, currentOffset + 2)
            const questionType = typeQuestionSection.readUInt16BE()
            currentOffset += 2

            const classQuestionSection = data.subarray(currentOffset, currentOffset + 2)
            const questionClass = classQuestionSection.readUInt16BE()
            currentOffset += 2

            const sequence: DNSMessageQuestionDecoded = {
                label: name,
                type: isAvailableType(questionType) ? questionType : QA_TYPE.HOST_ADDRESS,
                class: isAvailableClass(questionClass) ? questionClass : QA_CLASS.INTERNET,
            }

            labelSequences.push(sequence)

            questionCounter++
        }

        return { questions: labelSequences, offsetEnd: currentOffset }
    }

    static encode(questions: DNSMessageQuestionDecoded[]): Buffer {

        const sections = []

        for (const question of questions) {
            const labelSequence = getLabelSequenceBuffer(question.label)
            const typeClassSequence = getTypeClassSequenceBuffer({
                type: question.type,
                class: question.class,
            })
            sections.push(labelSequence, typeClassSequence)
        }

        const questionSection = Buffer.concat(sections)

        return questionSection
    }
}
