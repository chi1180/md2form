import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function ShortTextField({
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
      <Input
        id={`${fieldId}-input`}
        name={responseKey}
        type="text"
        placeholder={placeholder}
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        required={element.required}
        maxLength={element.maxLength}
      />
      {typeof element.maxLength === "number" && (
        <p className="text-xs text-muted-foreground text-right">
          {stringValue.length} / {element.maxLength}
        </p>
      )}
    </div>
  );
}
