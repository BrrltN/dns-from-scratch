import type { DNSMessageQuestionDecoded } from "./types"

import { getLabelSequenceBuffer, getTypeClassSequenceBuffer } from "./utils"

export class DNSMessageQuestion {
    static encode(question: DNSMessageQuestionDecoded): Buffer {

        const labelSequence = getLabelSequenceBuffer(question.labels)
        const typeClassSequence = getTypeClassSequenceBuffer({
            type: question.type,
            class: question.class,
        })

        const questionSection = Buffer.concat([labelSequence, typeClassSequence])

        return questionSection
    }
}
