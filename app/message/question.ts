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

    static decode(data: Buffer): DNSMessageQuestionDecoded | null {
        const HEADER_OFFSET = 12
        const questionSection = data.subarray(HEADER_OFFSET)

        const label = []
        let questionByteSize = 0

        const sequence: {
            byteSize: number | null,
            label: string[],
            readOffset: number
        } = { byteSize: null, label: [], readOffset: 0 }

        for (const chunk of questionSection) {
            questionByteSize++

            if (sequence.byteSize === null) {
                if (chunk === 0) {
                    break
                }
                sequence.byteSize = chunk
                continue
            }

            sequence.readOffset++

            sequence.label.push(String.fromCharCode(chunk))

            if (sequence.readOffset === sequence.byteSize) {
                label.push(sequence.label.join(""))

                // Reset
                sequence.byteSize = null
                sequence.label = []
                sequence.readOffset = 0
            }

        }

        const questionTypeOffset = questionByteSize
        const typeQuestionSection = questionSection.subarray(questionTypeOffset, questionTypeOffset + 2)
        const questionType = typeQuestionSection.readUInt16BE()

        const isAvailableType = this.#isAvailableQuestionType(questionType)
        if (!isAvailableType) {
            return null
        }

        questionByteSize += 2

        const questionClassOffset = questionByteSize
        const classQuestionSection = questionSection.subarray(questionClassOffset, questionClassOffset + 2)
        const questionClass = classQuestionSection.readUInt16BE()
        const isAvailableClass = this.#isAvailableQuestionClass(questionClass)
        if (!isAvailableClass) {
            return null
        }

        return {
            label: label.join("."),
            type: questionType,
            class: questionClass,
        }
    }

    static encode(question: DNSMessageQuestionDecoded): Buffer {

        const labelSequence = getLabelSequenceBuffer(question.label)
        const typeClassSequence = getTypeClassSequenceBuffer({
            type: question.type,
            class: question.class,
        })

        const questionSection = Buffer.concat([labelSequence, typeClassSequence])

        return questionSection
    }
}
