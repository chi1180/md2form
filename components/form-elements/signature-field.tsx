"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type FieldComponentProps } from "@/components/form-elements/types";

export function SignatureField({
  element,
  questionTitle,
  responseKey,
  fieldId,
  value,
  onChange,
}: FieldComponentProps) {
  const signaturePadRef = useRef<SignatureCanvas | null>(null);
  const [mode, setMode] = useState<"draw" | "upload">(
    element.captureMode === "upload" ? "upload" : "draw",
  );
  const [signatureDataUrl, setSignatureDataUrl] = useState(
    typeof value === "string" ? value : "",
  );

  useEffect(() => {
    if (typeof value === "string") {
      setSignatureDataUrl(value);

      if (mode === "draw" && value && signaturePadRef.current) {
        signaturePadRef.current.fromDataURL(value);
      }
      return;
    }

    if (mode === "draw") {
      signaturePadRef.current?.clear();
      setSignatureDataUrl("");
    }
  }, [mode, value]);

  const persistedUploadFile = value instanceof File ? value : null;

  return (
    <div key={`${responseKey}-container`} className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldId}>
          {questionTitle}
          {element.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setMode((prev) => (prev === "draw" ? "upload" : "draw"))}
        >
          {mode === "draw" ? "Use signature file" : "Draw signature"}
        </Button>
      </div>

      {mode === "upload" ? (
        <div className="space-y-2">
          <Input
            id={fieldId}
            name={responseKey}
            type="file"
            accept="image/*"
            required={element.required}
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              onChange(file || "");
            }}
          />
          {persistedUploadFile && (
            <div className="rounded-md border border-dashed border-border p-2">
              <p className="text-xs text-muted-foreground">Stored file:</p>
              <p className="text-xs text-muted-foreground truncate">
                {persistedUploadFile.name}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-md border border-input bg-background p-2">
            <SignatureCanvas
              ref={signaturePadRef}
              backgroundColor="#ffffff"
              penColor="#111827"
              canvasProps={{
                className: "h-40 w-full rounded-sm bg-white",
              }}
              onEnd={() => {
                const dataUrl = signaturePadRef.current?.toDataURL("image/png") || "";
                setSignatureDataUrl(dataUrl);
                onChange(dataUrl);
              }}
            />
          </div>
          {signatureDataUrl && (
            <div className="rounded-md border border-dashed border-border p-2">
              <p className="text-xs text-muted-foreground">Stored signature restored.</p>
            </div>
          )}
          <input
            type="hidden"
            id={fieldId}
            name={responseKey}
            value={signatureDataUrl}
            required={element.required}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                signaturePadRef.current?.clear();
                setSignatureDataUrl("");
                onChange("");
              }}
            >
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
