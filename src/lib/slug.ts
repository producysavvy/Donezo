import { nanoid } from "nanoid";

export function slugify(value: string) {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${base || "workspace"}-${nanoid(6)}`;
}
