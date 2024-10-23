
# DNS from Scratch

The goal of this project was to better understand the DNS protocol and improve skills in binary manipulations using TypeScript.

## Project Overview
This project is a DNS forwarder server built from scratch, intended to demonstrate a strong understanding of the DNS protocol. The server forwards DNS queries received over UDP to an external DNS resolver, specified by the `--resolver <address>` option.

**Note:** This project is not intended for production use but rather serves as a demonstration of a custom implementation of DNS forwarding. 

> This project is part of an exercise provided by Codecrafter.

## Motivation
- To explore and better understand the DNS protocol and its operations.
- To implement core functionalities such as handling DNS queries and responses.

## Features
- Receive DNS requests over UDP.
- Forward DNS queries to an external resolver.
- Return the responses back to the client.
- The external resolver can be set via the `--resolver <address>` option.

## Installation

To set up and run the project, follow these steps:

1. **Install dependencies:**
   This project uses [Bun](https://bun.sh/) for managing dependencies.
   ```bash
   bun install
   ```

2. **Start the server:**
   Run the server and specify the external DNS resolver:
   ```bash
   bun run app/server.ts --resolver 8.8.8.8
   ```

## How It Works

- The server listens for DNS queries on a specified UDP port.
- Upon receiving a query, it forwards it to the external DNS resolver.
- The response from the external resolver is then sent back to the client.
- This process allows for DNS query resolution using an external DNS server.

## Configuration

- `--resolver <address>`: Specifies the IP address of the external DNS server to forward queries to.
  
Example:
```bash
bun run app/server.ts --resolver 1.1.1.1
```

## Project Structure

- `app/`: Contains the main source code for the DNS forwarder server.
- `app/message/encoder`: Takes parsed data and converts it into a buffer formatted for the DNS protocol.
- `app/message/decoder`: Parses raw data from the DNS protocol to understand and process it.
- `app/app`: Encodes and decodes DNS requests, then forwards them to a resolver to get a response.

## Testing the Project

To test the DNS server locally via command line:

1. Start the server:
   ```bash
   bun app/server.ts
   ```

2. Use the `dig` command to send a DNS query to your local server:
   ```bash
   dig @127.0.0.1 -p 2053 domain_name.com
   ```

This will send a DNS request to the locally running server, which will forward the query to the external DNS resolver and return the response.