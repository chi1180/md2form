import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function CheckboxField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const arrayValue = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

  return (
    <div key={`${responseKey}-container`} className="space-y-3">
      <Label>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="space-y-2">
        {arrayValue.map((selectedOption, selectedIndex) => (
          <input
            key={`${responseKey}-selected-${selectedIndex}`}
            type="hidden"
            name={responseKey}
            value={selectedOption}
          />
        ))}
        {element.options?.map((option, optionIndex) => (
          <div
            key={`${responseKey}-option-${optionIndex}`}
            className="flex items-center space-x-2"
          >
            <Checkbox
              id={`${fieldId}-${optionIndex}`}
              checked={arrayValue.includes(option)}
              onCheckedChange={(checked) => {
                const newValues = checked === true
                  ? [...arrayValue, option]
                  : arrayValue.filter((v) => v !== option);
                onChange(newValues);
              }}
            />
            <label
              htmlFor={`${fieldId}-${optionIndex}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
      {(typeof element.minSelected === "number" ||
        typeof element.maxSelected === "number") && (
        <p className="text-xs text-muted-foreground text-right">
          {typeof element.minSelected === "number"
            ? `min ${element.minSelected}`
            : ""}
          {typeof element.minSelected === "number" &&
          typeof element.maxSelected === "number"
            ? " / "
            : ""}
          {typeof element.maxSelected === "number"
            ? `max ${element.maxSelected}`
            : ""}
        </p>
      )}
    </div>
  );
}
