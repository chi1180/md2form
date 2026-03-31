import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function VideoField({
  element,
  questionTitle,
  responseKey,
}: FieldComponentProps) {
  const width = element.width === "auto" || typeof element.width === "undefined"
    ? "100%"
    : `${element.width}px`;
  const height = element.height === "auto" || typeof element.height === "undefined"
    ? "320px"
    : `${element.height}px`;

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <Label>{questionTitle}</Label>
      {element.src ? (
        <video
          src={element.src}
          controls
          style={{ width, height }}
          className="rounded-md border border-border bg-black"
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <p className="text-sm text-muted-foreground">No video source provided.</p>
      )}
      {element.caption && <p className="text-xs text-muted-foreground">{element.caption}</p>}
    </div>
  );
}
