export interface FormElement {
  id?: string;
  type: string;
  title?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  searchable?: boolean;
  min?: number;
  max?: number;
  rows?: number | string[];
  columns?: string[];
  cellType?: "radio" | "checkbox" | "number" | "short_text";
  requiredPerRow?: boolean;
  onLabel?: string;
  offLabel?: string;
  description?: string;
  maxLength?: number;
  step?: number;
  integerOnly?: boolean;
  minDate?: string;
  maxDate?: string;
  includeTime?: boolean;
  minTime?: string;
  maxTime?: string;
  stepMinutes?: number;
  minSelected?: number;
  maxSelected?: number;
  minLabel?: string;
  maxLabel?: string;
  scale?: number;
  labels?: string[];
  icon?: string;
  statements?: string[];
  scaleLabels?: string[];
  requiredPerStatement?: boolean;
  allowedTypes?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  captureMode?: "draw" | "type" | "upload";
  src?: string;
  alt?: string;
  width?: number | "auto";
  height?: number | "auto";
  caption?: string;
  subtitle?: string;
}

export type MatrixRowValue = string | string[];
export type MatrixValue = Record<string, MatrixRowValue>;
export type ResponseValue =
  | string
  | string[]
  | boolean
  | MatrixValue
  | File
  | File[];

export interface FieldComponentProps {
  element: FormElement;
  questionTitle: string;
  responseKey: string;
  fieldId: string;
  value: ResponseValue | undefined;
  onChange: (value: ResponseValue) => void;
}
