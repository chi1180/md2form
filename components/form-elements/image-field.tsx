import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function ImageField({
  element,
  questionTitle,
  responseKey,
}: FieldComponentProps) {
  const width = element.width === "auto" || typeof element.width === "undefined"
    ? "100%"
    : `${element.width}px`;
  const height = element.height === "auto" || typeof element.height === "undefined"
    ? "auto"
    : `${element.height}px`;

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <Label>{questionTitle}</Label>
      {element.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={element.src}
          alt={element.alt || questionTitle}
          style={{ width, height }}
          className="rounded-md border border-border object-cover"
        />
      ) : (
        <p className="text-sm text-muted-foreground">No image source provided.</p>
      )}
      {element.caption && <p className="text-xs text-muted-foreground">{element.caption}</p>}
    </div>
  );
}
