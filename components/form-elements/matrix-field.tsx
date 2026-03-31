import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type FieldComponentProps,
  type ResponseValue,
  type MatrixValue,
  type MatrixRowValue,
} from "@/components/form-elements/types";

function isMatrixValue(value: FieldComponentProps["value"]): value is MatrixValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRowValue(
  matrixValue: MatrixValue,
  rowName: string,
  cellType: FieldComponentProps["element"]["cellType"],
): MatrixRowValue {
  const current = matrixValue[rowName];
  if (cellType === "checkbox") {
    return Array.isArray(current) ? current : [];
  }
  return typeof current === "string" ? current : "";
}

export function MatrixField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const rows = Array.isArray(element.rows)
    ? element.rows
    : typeof element.rows === "number"
      ? Array.from({ length: element.rows }).map((_, index) => `Row ${index + 1}`)
      : [];
  const columns = element.columns || [];
  const matrixValue = isMatrixValue(value) ? value : {};
  const cellType = element.cellType || "radio";

  const updateRowValue = (rowName: string, rowValue: MatrixRowValue) => {
    onChange(
      {
        ...matrixValue,
        [rowName]: rowValue,
      } as ResponseValue,
    );
  };

  const columnTemplateStyle = {
    gridTemplateColumns: `minmax(160px, 1fr) repeat(${Math.max(columns.length, 1)}, minmax(110px, 1fr))`,
  };

  return (
    <div key={`${responseKey}-container`} className="space-y-3">
      <Label>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="rounded-md border border-border overflow-auto">
        <div className="min-w-max">
        <div className="grid text-xs font-medium bg-muted/50" style={columnTemplateStyle}>
          <div className="p-3 border-r border-border">Items</div>
          {columns.map((column, columnIndex) => (
            <div key={`${responseKey}-header-${columnIndex}`} className="p-3 border-r border-border last:border-r-0 text-center">
              {column}
            </div>
          ))}
        </div>
        {rows.map((row, rowIndex) => {
          const currentRowValue = getRowValue(matrixValue, row, cellType);
          return (
            <div
              key={`${responseKey}-row-${rowIndex}`}
              className="grid border-t border-border"
              style={columnTemplateStyle}
            >
              <div className="p-3 border-r border-border text-sm">{row}</div>
              {columns.map((column, columnIndex) => {
                const cellName = `${responseKey}:${row}`;
                const cellId = `${fieldId}-${rowIndex}-${columnIndex}`;

                if (cellType === "checkbox") {
                  const selectedColumns = Array.isArray(currentRowValue)
                    ? currentRowValue
                    : [];
                  const isChecked = selectedColumns.includes(column);

                  return (
                    <div
                      key={`${responseKey}-cell-${rowIndex}-${columnIndex}`}
                      className="p-3 border-r border-border last:border-r-0 flex items-center justify-center"
                    >
                      <Checkbox
                        id={cellId}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const nextValues = checked === true
                            ? [...selectedColumns, column]
                            : selectedColumns.filter((item) => item !== column);
                          updateRowValue(row, nextValues);
                        }}
                      />
                      {isChecked && (
                        <input
                          type="hidden"
                          name={cellName}
                          value={column}
                        />
                      )}
                    </div>
                  );
                }

                if (cellType === "number") {
                  return (
                    <div
                      key={`${responseKey}-cell-${rowIndex}-${columnIndex}`}
                      className="p-2 border-r border-border last:border-r-0"
                    >
                      <Input
                        id={cellId}
                        type="number"
                        value={
                          columnIndex === 0 && typeof currentRowValue === "string"
                            ? currentRowValue
                            : ""
                        }
                        onChange={(event) => {
                          if (columnIndex === 0) {
                            updateRowValue(row, event.target.value);
                          }
                        }}
                        disabled={columnIndex !== 0}
                      />
                      {columnIndex === 0 && (
                        <input
                          type="hidden"
                          name={cellName}
                          value={typeof currentRowValue === "string" ? currentRowValue : ""}
                        />
                      )}
                    </div>
                  );
                }

                if (cellType === "short_text") {
                  return (
                    <div
                      key={`${responseKey}-cell-${rowIndex}-${columnIndex}`}
                      className="p-2 border-r border-border last:border-r-0"
                    >
                      <Input
                        id={cellId}
                        type="text"
                        value={
                          columnIndex === 0 && typeof currentRowValue === "string"
                            ? currentRowValue
                            : ""
                        }
                        onChange={(event) => {
                          if (columnIndex === 0) {
                            updateRowValue(row, event.target.value);
                          }
                        }}
                        disabled={columnIndex !== 0}
                      />
                      {columnIndex === 0 && (
                        <input
                          type="hidden"
                          name={cellName}
                          value={typeof currentRowValue === "string" ? currentRowValue : ""}
                        />
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={`${responseKey}-cell-${rowIndex}-${columnIndex}`}
                    className="p-3 border-r border-border last:border-r-0 flex items-center justify-center"
                  >
                    <RadioGroup
                      value={typeof currentRowValue === "string" ? currentRowValue : ""}
                      onValueChange={(next) => updateRowValue(row, next)}
                    >
                      <RadioGroupItem
                        id={cellId}
                        value={column}
                      />
                    </RadioGroup>
                    <input
                      type="hidden"
                      name={cellName}
                      value={typeof currentRowValue === "string" ? currentRowValue : ""}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
