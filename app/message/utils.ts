import { QA_CLASS, QA_TYPE } from "./constants"
import type { QAType, QAClass } from "./types"

export function getLabelSequenceBuffer(label: string): Buffer {
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

export function getTypeClassSequenceBuffer(values: { type: QAType, class: QAClass }): Buffer {
    const typeClassSequence = Buffer.alloc(4)
    typeClassSequence.writeInt16BE(values.type)
    typeClassSequence.writeInt16BE(values.class, 2)
    return typeClassSequence
}

export function decodeLabels(data: Buffer, startOffset: number): { name: string, endOffset: number } {
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

            const result = decodeLabels(data, offsetReference)
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

export function isAvailableType(QAType: number): QAType is QAType {
    for (const QATypeValue of Object.values(QA_TYPE)) {
        if (QAType === QATypeValue) {
            return true
        }
    }
    return false
}

export function isAvailableClass(QAClass: number): QAClass is QAClass {
    for (const QAClassValue of Object.values(QA_CLASS)) {
        if (QAClass === QAClassValue) {
            return true
        }
    }
    return false
}