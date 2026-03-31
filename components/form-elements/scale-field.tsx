import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function ScaleField({
  element,
  questionTitle,
  responseKey,
  value,
  onChange,
}: FieldComponentProps) {
  const min = typeof element.min === "number" ? element.min : 1;
  const max = typeof element.max === "number" ? element.max : 5;
  const step = typeof element.step === "number" ? element.step : 1;
  const stringValue = typeof value === "string" ? value : "";
  const numericValue = Number(stringValue);
  const safeValue = Number.isFinite(numericValue) ? numericValue : min;

  return (
    <div key={`${responseKey}-container`} className="space-y-3">
      <Label>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <input type="hidden" name={responseKey} value={String(safeValue)} />
      <div className="px-2">
        <Slider
          min={min}
          max={max}
          step={step}
          value={[safeValue]}
          onValueChange={(next) => {
            const nextValue = next[0];
            onChange(String(nextValue));
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{element.minLabel || min}</span>
        <span className="text-sm font-medium text-foreground">{safeValue}</span>
        <span>{element.maxLabel || max}</span>
      </div>
    </div>
  );
}
