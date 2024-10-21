import type { QuestionAnswerType, QuestionAnswerClass } from "./types"

export function getLabelSequenceBuffer(labels: string[]): Buffer {
    const chunks: (Buffer | Uint8Array)[] = []

    for (const label of labels) {
        const domains = label.split(".")
        for (const domain of domains) {
            const domainBuffer = Buffer.from(domain)
            chunks.push(new Uint8Array([domainBuffer.byteLength]), domainBuffer)
        }
    }
    const endSection = new Uint8Array([0])
    chunks.push(endSection)

    const labelSequence = Buffer.concat(chunks)

    return labelSequence
}

export function getTypeClassSequenceBuffer(values: { type: QuestionAnswerType, class: QuestionAnswerClass }): Buffer {
    const typeClassSequence = Buffer.alloc(4)
    typeClassSequence.writeInt16BE(values.type)
    typeClassSequence.writeInt16BE(values.class, 2)
    return typeClassSequence
}