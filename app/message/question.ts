import { QUESTION_CLASS, QUESTION_TYPE } from "./constants"
import type { DNSMessageQuestionDecoded, QuestionAnswerType, QuestionAnswerClass } from "./types"

import { getLabelSequenceBuffer, getTypeClassSequenceBuffer } from "./utils"

export class DNSMessageQuestion {
    static #isAvailableQuestionType(questionType: number): questionType is QuestionAnswerType {
        for (const questionTypeValue of Object.values(QUESTION_TYPE)) {
            if (questionType === questionTypeValue) {
                return true
            }
        }
        return false
    }

    static #isAvailableQuestionClass(questionClass: number): questionClass is QuestionAnswerClass {
        for (const questionClassValue of Object.values(QUESTION_CLASS)) {
            if (questionClass === questionClassValue) {
                return true
            }
        }
        return false
    }

    static #decodeLabels(data: Buffer, startOffset: number): { name: string, endOffset: number } {
        const labels: string[] = []

        let offset = startOffset
        let isPointerFollow = false

        while (true) {

            const currentByte = data[offset]

            const isCompression = (currentByte & 0b1100_0000) !== 0
            if (isCompression) {

                isPointerFollow = true

                const compressBytes = data.subarray(offset, offset + 2)
                const compressBytesValue = compressBytes.readUInt16BE()
                const offsetReference = compressBytesValue & 0b0011_1111_1111_1111

                const result = this.#decodeLabels(data, offsetReference)
                labels.push(result.name)
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
                data.subarray(labelStartOffSet, labelEndOffset).toString()
            )

            offset = labelEndOffset
        }

        return { name: labels.join("."), endOffset: offset };
    }


    static decode(data: Buffer, headerQuestionCount: number): DNSMessageQuestionDecoded[] | null {
        const HEADER_OFFSET = 12
        let currentOffset = HEADER_OFFSET
        let questionCounter = 0

        const labelSequences: DNSMessageQuestionDecoded[] = []

        while (questionCounter < headerQuestionCount) {
            const { name, endOffset } = this.#decodeLabels(data, currentOffset)

            currentOffset = endOffset

            const typeQuestionSection = data.subarray(currentOffset, currentOffset + 2)
            const questionType = typeQuestionSection.readUInt16BE()
            currentOffset += 2

            const classQuestionSection = data.subarray(currentOffset, currentOffset + 2)
            const questionClass = classQuestionSection.readUInt16BE()
            currentOffset += 2

            const sequence: DNSMessageQuestionDecoded = {
                label: name,
                type: this.#isAvailableQuestionType(questionType) ? questionType : QUESTION_TYPE.HOST_ADDRESS,
                class: this.#isAvailableQuestionClass(questionClass) ? questionClass : QUESTION_CLASS.INTERNET,
            }

            labelSequences.push(sequence)

            questionCounter++
        }

        return labelSequences
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
