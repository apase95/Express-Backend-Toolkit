import crypto from "node:crypto";

const URL_ALPHABET = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

export const nanoid = (size: number = 21): string => {
    let id = "";
    const bytes = crypto.randomBytes(size);

    for (let i = 0; i < size; i++) {
        const byte = bytes[i] ?? 0;
        id += URL_ALPHABET[byte & 63];
    }
    return id;
};

export const uuid = (): string => {
    return crypto.randomUUID();
};