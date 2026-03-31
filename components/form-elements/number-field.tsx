import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function NumberField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const stringValue = typeof value === "string" ? value : "";
  const placeholder = element.placeholder?.replace(/^["']|["']$/g, "") || "";
  const numberStep = element.integerOnly ? 1 : element.step;

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <Label htmlFor={fieldId}>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        name={responseKey}
        type="number"
        placeholder={placeholder}
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        min={element.min}
        max={element.max}
        step={numberStep}
        required={element.required}
      />
      {(typeof element.min === "number" ||
        typeof element.max === "number" ||
        typeof numberStep === "number") && (
        <p className="text-xs text-muted-foreground text-right">
          {typeof element.min === "number" ? `min ${element.min}` : ""}
          {typeof element.min === "number" && typeof element.max === "number"
            ? " / "
            : ""}
          {typeof element.max === "number" ? `max ${element.max}` : ""}
          {typeof numberStep === "number"
            ? `${typeof element.min === "number" || typeof element.max === "number" ? " / " : ""}step ${numberStep}`
            : ""}
        </p>
      )}
    </div>
  );
}
