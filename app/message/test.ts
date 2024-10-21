import { QUESTION_CLASS, QUESTION_TYPE } from "./const"
import { getLabelSequenceBuffer, getTypeClassSequenceBuffer } from "./utils"

const questionNames = ["codecrafters.io"]

const question = {
    labels: questionNames,
    type: QUESTION_TYPE.HOST_ADDRESS,
    class: QUESTION_CLASS.INTERNET,
}

// Name	Label Sequence	The domain name encoded as a sequence of labels.
// Type	2-byte Integer	1 for an A record, 5 for a CNAME record etc., full list here
// Class	2-byte Integer	Usually set to 1 (full list here)
// TTL (Time-To-Live)	4-byte Integer	The duration in seconds a record can be cached before requerying.
// Length (RDLENGTH)	2-byte Integer	Length of the RDATA field in bytes.
// Data (RDATA)	Variable	Data specific to the record type.



const labelSequence = getLabelSequenceBuffer(question.labels)
const typeClassSequence = getTypeClassSequenceBuffer({
    type: question.type,
    class: question.class,
})

// Define TTL
const timeToLive = Buffer.alloc(4)
timeToLive.writeInt32BE(42)

// Define DATA 
const data = Buffer.from([8, 8, 8, 8])
// Define DATA length
const dataLength = Buffer.alloc(2)
dataLength.writeInt16BE(data.byteLength)



const answerSection = Buffer.concat([labelSequence, typeClassSequence, timeToLive, dataLength, data])
console.log({ answerSection })

