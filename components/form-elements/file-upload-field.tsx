import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

const MIME_MAP: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

export function FileUploadField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const persistedFiles = Array.isArray(value)
    ? value.filter((item): item is File => item instanceof File)
    : value instanceof File
      ? [value]
      : [];

  const accept = (element.allowedTypes || [])
    .map((ext) => MIME_MAP[ext] || `.${ext}`)
    .join(",");

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <Label htmlFor={fieldId}>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        name={responseKey}
        type="file"
        required={element.required}
        accept={accept || undefined}
        multiple={(element.maxFiles || 1) > 1}
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          const totalSizeMB = files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);

          let message = "";
          if (typeof element.maxFiles === "number" && files.length > element.maxFiles) {
            message = `You can upload up to ${element.maxFiles} file(s).`;
          } else if (
            typeof element.maxSizeMB === "number" &&
            totalSizeMB > element.maxSizeMB
          ) {
            message = `Total upload size must be ${element.maxSizeMB}MB or less.`;
          }

          event.currentTarget.setCustomValidity(message);
          if (message) {
            event.currentTarget.reportValidity();
            onChange([]);
            return;
          }

          onChange(files);
        }}
      />
      {persistedFiles.length > 0 && (
        <div className="rounded-md border border-dashed border-border p-2">
          <p className="text-xs text-muted-foreground">
            Stored selection: {persistedFiles.length} file(s)
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {persistedFiles.map((file) => file.name).join(", ")}
          </p>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-right">
        {(element.allowedTypes || []).length > 0
          ? `types: ${(element.allowedTypes || []).join(", ")}`
          : "all file types"}
        {typeof element.maxFiles === "number" ? ` / max ${element.maxFiles} files` : ""}
        {typeof element.maxSizeMB === "number" ? ` / max ${element.maxSizeMB}MB total` : ""}
      </p>
    </div>
  );
}
