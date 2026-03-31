import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function RadioField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const stringValue = typeof value === "string" ? value : "";

  return (
    <div key={`${responseKey}-container`} className="space-y-3">
      <Label>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <input type="hidden" name={responseKey} value={stringValue} />
      <RadioGroup value={stringValue} onValueChange={onChange} className="space-y-2">
        {element.options?.map((option, optionIndex) => (
          <div
            key={`${responseKey}-option-${optionIndex}`}
            className="flex items-center space-x-2"
          >
            <RadioGroupItem
              id={`${fieldId}-${optionIndex}`}
              value={option}
            />
            <label
              htmlFor={`${fieldId}-${optionIndex}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
