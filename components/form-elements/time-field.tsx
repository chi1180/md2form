import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function TimeField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const stringValue = typeof value === "string" ? value : "";
  const stepInMinutes =
    typeof element.stepMinutes === "number" ? element.stepMinutes : undefined;

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <Label htmlFor={fieldId}>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        name={responseKey}
        type="time"
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        required={element.required}
        min={element.minTime}
        max={element.maxTime}
        step={typeof stepInMinutes === "number" ? stepInMinutes * 60 : undefined}
      />
      {(element.minTime || element.maxTime || typeof stepInMinutes === "number") && (
        <p className="text-xs text-muted-foreground text-right">
          {element.minTime ? `from ${element.minTime}` : ""}
          {element.minTime && element.maxTime ? " / " : ""}
          {element.maxTime ? `to ${element.maxTime}` : ""}
          {typeof stepInMinutes === "number"
            ? `${element.minTime || element.maxTime ? " / " : ""}${stepInMinutes} min step`
            : ""}
        </p>
      )}
    </div>
  );
}
