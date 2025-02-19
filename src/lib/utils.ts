import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sanitizeOptions = {
  allowedTags: [],
  allowedAttributes: {
    a: ["href"],
  },
  // Strip out any HTML comments
  allowedComments: [],
  // Ensure text is properly spaced after tags
  textFilter: (text: string) => {
    return decodeHTMLEntitiesServer(text.replace(/\s+/g, " ").trim());
  },
};

export function decodeHTMLEntitiesServer(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#39;/g, "'")
    .replace(/&#47;/g, "/");
}
