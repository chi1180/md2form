import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function PhoneField({
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
      <Label htmlFor={fieldId}>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <PhoneInput
        id={fieldId}
        name={responseKey}
        placeholder={placeholder}
        value={stringValue}
        onChange={(nextValue: string | undefined) => onChange(nextValue || "")}
        defaultCountry="JP"
        international
        required={element.required}
      />
    </div>
  );
}
