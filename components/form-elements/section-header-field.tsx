import { type FieldComponentProps } from "@/components/form-elements/types";

export function SectionHeaderField({
  element,
  questionTitle,
  responseKey,
}: FieldComponentProps) {
  return (
    <div key={`${responseKey}-container`} className="rounded-md border border-border bg-muted/30 p-4 space-y-1">
      <h3 className="text-base font-semibold">{element.title || questionTitle}</h3>
      {element.subtitle && (
        <p className="text-sm text-muted-foreground">{element.subtitle}</p>
      )}
    </div>
  );
}
