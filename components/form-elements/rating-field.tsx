import { Star, Heart, Circle, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type FieldComponentProps } from "@/components/form-elements/types";

const ICON_MAP = {
  star: Star,
  heart: Heart,
  circle: Circle,
  thumbs_up: ThumbsUp,
} as const;

export function RatingField({
  element,
  questionTitle,
  responseKey,
  value,
  onChange,
}: FieldComponentProps) {
  const maxScale = typeof element.scale === "number" ? element.scale : 5;
  const numericValue = Number(typeof value === "string" ? value : "");
  const selected = Number.isFinite(numericValue) ? numericValue : 0;
  const Icon =
    ICON_MAP[(element.icon || "star") as keyof typeof ICON_MAP] || Star;
  const minLabel = element.labels?.[0] || "Low";
  const maxLabel = element.labels?.[1] || "High";

  return (
    <div key={`${responseKey}-container`} className="space-y-3">
      <Label>
        {questionTitle}
        {element.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <br />
      <input
        type="hidden"
        name={responseKey}
        value={selected > 0 ? String(selected) : ""}
      />
      <div className="inline-flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: maxScale }).map((_, index) => {
            const score = index + 1;
            const isActive = score <= selected;
            return (
              <Button
                key={`${responseKey}-score-${score}`}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => onChange(String(score))}
                aria-label={`Rate ${score}`}
              >
                <Icon className="h-4 w-4" />
                <span className="ml-1">{score}</span>
              </Button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    </div>
  );
}
