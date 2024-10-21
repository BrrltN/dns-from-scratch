// https://www.rfc-editor.org/rfc/rfc1035#section-4.1.1
export const OPERATION_CODE = {
    QUERY: 0,
    IQUERY: 1,
    STATUS: 2,
} as const

// https://www.rfc-editor.org/rfc/rfc1035#section-4.1.1
export const RESPONSE_CODE = {
    NO_ERROR: 0,
    FORMAT_ERROR: 1,
    SERVER_FAIL: 2,
    NO_EXISTENT_DOMAIN: 3,
    NOT_IMPLEMENTED: 4,
    REFUSED: 5,
} as const

// https://www.rfc-editor.org/rfc/rfc1035#section-3.2.2
export const QUESTION_TYPE = {
    HOST_ADDRESS: 1,
    AUTHORITATIVE_NAME_SERVER: 2,
    MAIL_DESTINATION: 3, // deprecated
    MAIL_FORWARDER: 4, // deprecated
    CANONICAL_NAME: 5,
    START_ZONE_AUTHORITY: 6,
    MAILBOX: 7,
    MAIL_GROUP: 8,
    MAIL_RENAME: 9,
    NULL: 10,
    WELL_KNOW_SERVICE: 11,
    DOMAIN_NAME_POINTER: 12,
    HOST_INFO: 13,
    MAIL_INFO: 14,
    MAIL_EXCHANGE: 15,
    TXT: 16,
} as const

// https://www.rfc-editor.org/rfc/rfc1035#section-3.2.4
export const QUESTION_CLASS = {
    INTERNET: 1,
    CSNET: 2,
    CHOAS: 3,
    HESIOD: 4,
} as const
