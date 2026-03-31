import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type FieldComponentProps,
  type MatrixValue,
  type ResponseValue,
} from "@/components/form-elements/types";

function isMatrixValue(value: FieldComponentProps["value"]): value is MatrixValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function LikertField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const statements = element.statements || [];
  const labels = element.scaleLabels || [];
  const current = isMatrixValue(value) ? value : {};

  const updateStatement = (statement: string, nextValue: string | string[]) => {
    onChange({
      ...current,
      [statement]: nextValue,
    } as ResponseValue);
  };

  return (
    <div key={`${responseKey}-container`} className="space-y-3">
      <Label>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="rounded-md border border-border overflow-auto">
        <div className="min-w-max">
          <div
            className="grid bg-muted/50 text-xs font-medium"
            style={{
              gridTemplateColumns: `minmax(180px, 1fr) repeat(${Math.max(labels.length, 1)}, minmax(120px, 1fr))`,
            }}
          >
            <div className="sticky left-0 z-20 p-3 border-r border-border bg-muted/50">
              Statements
            </div>
            {labels.map((label, index) => (
              <div
                key={`${responseKey}-header-${index}`}
                className="p-3 border-r border-border last:border-r-0 text-center"
              >
                {label}
              </div>
            ))}
          </div>

          {statements.map((statement, rowIndex) => {
            const rowValue = current[statement];
            const selectedValue = typeof rowValue === "string" ? rowValue : "";
            const selectedValues = Array.isArray(rowValue) ? rowValue : [];

            return (
              <div
                key={`${responseKey}-statement-${rowIndex}`}
                className="grid border-t border-border"
                style={{
                  gridTemplateColumns: `minmax(180px, 1fr) repeat(${Math.max(labels.length, 1)}, minmax(120px, 1fr))`,
                }}
              >
                <div className="sticky left-0 z-10 p-3 border-r border-border text-sm bg-background">
                  {statement}
                </div>

                {element.requiredPerStatement ? (
                  <>
                    <input
                      type="hidden"
                      name={`${responseKey}:${statement}`}
                      value={selectedValue}
                    />
                    <RadioGroup
                      value={selectedValue}
                      onValueChange={(next) => updateStatement(statement, next)}
                      className="contents"
                    >
                      {labels.map((label, colIndex) => (
                        <div
                          key={`${responseKey}-cell-${rowIndex}-${colIndex}`}
                          className="p-3 border-r border-border last:border-r-0 flex justify-center"
                        >
                          <RadioGroupItem
                            id={`${fieldId}-${rowIndex}-${colIndex}`}
                            value={label}
                          />
                        </div>
                      ))}
                    </RadioGroup>
                  </>
                ) : (
                  labels.map((label, colIndex) => {
                    const isChecked = selectedValues.includes(label);
                    return (
                      <div
                        key={`${responseKey}-cell-${rowIndex}-${colIndex}`}
                        className="p-3 border-r border-border last:border-r-0 flex justify-center"
                      >
                        <Checkbox
                          id={`${fieldId}-${rowIndex}-${colIndex}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const nextValues = checked === true
                              ? [...selectedValues, label]
                              : selectedValues.filter((item) => item !== label);
                            updateStatement(statement, nextValues);
                          }}
                        />
                        {isChecked && (
                          <input
                            type="hidden"
                            name={`${responseKey}:${statement}`}
                            value={label}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
