import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function BooleanField({
  element,
  questionTitle,
  responseKey,
  value,
  onChange,
}: FieldComponentProps) {
  const booleanValue = typeof value === "boolean" ? value : undefined;

  return (
    <div key={`${responseKey}-container`} className="space-y-3">
      <Label>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <input
        type="hidden"
        name={responseKey}
        value={
          booleanValue === true ? "true" : booleanValue === false ? "false" : ""
        }
      />
      <div className="flex gap-4">
        <Button
          type="button"
          variant={booleanValue === true ? "default" : "outline"}
          onClick={() => onChange(true)}
        >
          {element.onLabel || "Yes"}
        </Button>
        <Button
          type="button"
          variant={booleanValue === false ? "default" : "outline"}
          onClick={() => onChange(false)}
        >
          {element.offLabel || "No"}
        </Button>
      </div>
    </div>
  );
}
