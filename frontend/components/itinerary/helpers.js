export const safeText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (typeof value === "object") {
    if (value.text) return value.text; // Google Places format
    return JSON.stringify(value);
  }
  return String(value);
};

export const safeArrayText = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => safeText(item));
};

export const formatTypes = (types) => {
  return safeArrayText(types)
    .map((t) =>
      t
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    )
    .join(", ");
};
