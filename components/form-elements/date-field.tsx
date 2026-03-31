import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function DateField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const stringValue = typeof value === "string" ? value : "";
  const inputType = element.includeTime ? "datetime-local" : "date";

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <Label htmlFor={fieldId}>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        name={responseKey}
        type={inputType}
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        required={element.required}
        min={element.minDate}
        max={element.maxDate}
      />
      {(element.minDate || element.maxDate || element.includeTime) && (
        <p className="text-xs text-muted-foreground text-right">
          {element.minDate ? `from ${element.minDate}` : ""}
          {element.minDate && element.maxDate ? " / " : ""}
          {element.maxDate ? `to ${element.maxDate}` : ""}
          {element.includeTime
            ? `${element.minDate || element.maxDate ? " / " : ""}with time`
            : ""}
        </p>
      )}
    </div>
  );
}
