import type { DNSMessageAnswerDecoded } from "./types"

import { getLabelSequenceBuffer, getTypeClassSequenceBuffer } from "./utils"

export class DNSMessageAnswer {

    static encode(answer: DNSMessageAnswerDecoded): Buffer {

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


        const answerSection = Buffer.concat([labelSequence, typeClassSequence, timeToLive, dataLength, data])

        return answerSection
    }
}
