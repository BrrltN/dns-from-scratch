import type { DNSMessageAnswerDecoded } from "./types"

import { getLabelSequenceBuffer, getTypeClassSequenceBuffer } from "./utils"

export class DNSMessageAnswer {

    static encode(answers: DNSMessageAnswerDecoded[]): Buffer {

        const sections = []

        for (const answer of answers) {
            const labelSequence = getLabelSequenceBuffer(answer.label)
            const typeClassSequence = getTypeClassSequenceBuffer({
                type: answer.type,
                class: answer.class,
            })

            const timeToLive = Buffer.alloc(4)
            timeToLive.writeInt32BE(answer.timeToLeave)

            const data = Buffer.from(answer.ipAddress)

            const dataLength = Buffer.alloc(2)
            dataLength.writeInt16BE(data.byteLength)

            sections.push(labelSequence, typeClassSequence, timeToLive, dataLength, data)
        }

        const answerSection = Buffer.concat(sections)

        return answerSection
    }
}
