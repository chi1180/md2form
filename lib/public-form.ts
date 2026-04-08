type GenericRecord = Record<string, unknown>;

export function sanitizePublicSchema(schema: unknown) {
  if (!schema || typeof schema !== "object") {
    return schema;
  }

  const root = structuredClone(schema) as GenericRecord;
  const pages = Array.isArray(root.pages) ? root.pages : [];

  root.pages = pages.map((page) => {
    const pageRecord = page as GenericRecord;
    const elements = Array.isArray(pageRecord.elements) ? pageRecord.elements : [];

    pageRecord.elements = elements
      .filter((element) => (element as GenericRecord).type !== "file_upload")
      .map((element) => {
        const nextElement = { ...(element as GenericRecord) };
        if (nextElement.type === "signature") {
          nextElement.captureMode = "draw";
        }
        return nextElement;
      });

    return pageRecord;
  });

  return root;
}

export function dataUrlToBuffer(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  const mime = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");
  return { mime, buffer };
}
