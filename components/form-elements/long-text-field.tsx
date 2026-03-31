import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function LongTextField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const stringValue = typeof value === "string" ? value : "";
  const placeholder = element.placeholder?.replace(/^["']|["']$/g, "") || "";

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <Label htmlFor={`${fieldId}-input`}>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <textarea
        id={`${fieldId}-input`}
        name={responseKey}
        placeholder={placeholder}
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        required={element.required}
        rows={element.rows || 4}
        maxLength={element.maxLength}
        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      {typeof element.maxLength === "number" && (
        <p className="text-xs text-muted-foreground text-right">
          {stringValue.length} / {element.maxLength}
        </p>
      )}
    </div>
  );
}
