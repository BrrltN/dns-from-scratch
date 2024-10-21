import type { DNSMessageQuestionDecoded } from "./types"

export class DNSMessageQuestion {
    static encode(question: DNSMessageQuestionDecoded): Buffer {
        const chunks = []

        for (const questionName of question.labels) {
            const domains = questionName.split(".")
            for (const domain of domains) {
                const domainBuffer = Buffer.from(domain)
                chunks.push(Buffer.from([domainBuffer.byteLength]), domainBuffer)
            }
        }

        const content = Buffer.concat(chunks)

        const questionFooter = Buffer.alloc(4)
        questionFooter.writeInt16BE(question.type)
        questionFooter.writeInt16BE(question.class, 2)

        const endSection = new Uint8Array([0])

        const questionSection = Buffer.concat([content, endSection, questionFooter])

        return questionSection
    }
}
