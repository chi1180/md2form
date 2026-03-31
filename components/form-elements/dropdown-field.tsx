import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function DropdownField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const stringValue = typeof value === "string" ? value : "";
  const normalizedOptions = (element.options || []).map((option, optionIndex) => ({
    id: `${responseKey}-option-${optionIndex}`,
    label: option,
  }));
  const selectedOption = normalizedOptions.find((option) => option.label === stringValue);
  const selectedId = selectedOption?.id || "";

  const handleSelectChange = (selectedOptionId: string) => {
    const nextOption = normalizedOptions.find((option) => option.id === selectedOptionId);
    onChange(nextOption?.label || "");
  };

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <Label htmlFor={fieldId}>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <input
        type="hidden"
        id={fieldId}
        name={responseKey}
        value={stringValue}
        required={element.required}
      />
      {element.searchable ? (
        <Combobox
          options={normalizedOptions.map((option) => ({
            value: option.id,
            label: option.label,
          }))}
          value={selectedId}
          onValueChange={handleSelectChange}
          placeholder="Select an option"
          searchPlaceholder="Search options..."
        />
      ) : (
        <Select value={selectedId} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {normalizedOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
