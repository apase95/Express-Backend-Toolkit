
export const slugify = (
    str: string, 
    separator: string = "-"
): string => {
    
    if (!str) return "";

    return str
        .toString()
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s]+/g, separator)
        .replace(new RegExp(`\\${separator}+`, "g"), separator);
};