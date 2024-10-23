import { createSocket } from "dgram"

import { handleDNSRequest } from "./app"

const defaultResolver = { ip: "1.1.1.1", port: 53 }

const customResolver = process.argv[3]?.split(":")

export const resolverIp = customResolver ? customResolver[0] : defaultResolver.ip
export const resolverPort = customResolver ? parseInt(customResolver[1]) : defaultResolver.port

const server = createSocket("udp4")

server.on('error', (error) => {
    console.log(`Socket error: ${error}`)
})

server.on("message", async (data, remoteAddr) => {

    const response = await handleDNSRequest(data)

    server.send(response, remoteAddr.port, remoteAddr.address)
})

server.bind(2053, "127.0.0.1")