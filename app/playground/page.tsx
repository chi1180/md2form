"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { parseMarkdownToForm } from "md2form";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { FormRenderer, type FormData } from "@/components/form-renderer";
import { MarkdownEditor } from "@/components/markdown-editor";
import { DEFAULT_FORM_FRONTMATTER_MARKDOWN } from "@/lib/CONFIG";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DEFAULT_MARKDOWN = `${DEFAULT_FORM_FRONTMATTER_MARKDOWN}
# md2form Full Feature Playground

This sample includes all major question types and representative properties.

## Text Inputs

### Short Text: Full Name
#type short_text
#placeholder "山田 太郎"
#required true
#maxLength 60
#default ""
#visible true

---

### Long Text: Self Introduction
#type long_text
#placeholder "自己紹介を入力してください"
#rows 4
#required false
#maxLength 300

---

### Number: Years of Experience
#type number
#placeholder "3"
#required true
#min 0
#max 40
#step 1
#integerOnly true

---

### Email: Contact Email
#type email
#placeholder "you@example.com"
#required true

---

### Phone: Mobile Number
#type phone
#placeholder "090-1234-5678"
#required false

---

## Choice Inputs

### Dropdown: Preferred Work Style
#type dropdown
#options "Remote","Hybrid","Office"
#searchable true
#allowOther false
#required true

---

### Radio: Preferred Contact Method
#type radio
#options "Email","Phone","Chat"
#allowOther false
#required true

---

### Checkbox: Skills
#type checkbox
#options "TypeScript","React","Node.js","Design"
#required true
#minSelected 1
#maxSelected 3

---

## Date and Time

### Date: Available Start Date
#type date
#required true
#includeTime false
#minDate "2026-01-01"
#maxDate "2027-12-31"

---

### Time: Preferred Interview Time
#type time
#required true
#minTime "09:00"
#maxTime "18:00"
#stepMinutes 30

---

## Scale and Evaluation

### Rating: Product Satisfaction
#type rating
#required true
#scale 5
#labels "不満","満足"
#icon star

---

### Likert: Team Survey
#type likert
#required false
#statements "目標が明確","協力しやすい","学習機会がある"
#scaleLabels "全くそう思わない","そう思わない","普通","そう思う","とてもそう思う"
#requiredPerStatement true

---

### Matrix: Weekly Availability
#type matrix
#required false
#rows "月","火","水","木","金"
#columns "午前","午後","夜"
#cellType checkbox
#requiredPerRow false

---

### Scale: Confidence Level
#type scale
#required true
#min 1
#max 10
#step 1
#minLabel "低い"
#maxLabel "高い"

---

## Upload and Signature

### File Upload: Portfolio
#type file_upload
#required false
#allowedTypes "pdf","docx","jpg","png"
#maxFiles 3
#maxSizeMB 20

---

### Signature: Agreement
#type signature
#required true
#captureMode draw

---

## Media and Layout

### Image: Company Logo
#type image
#src "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
#alt "Company logo"
#width auto
#height auto
#caption "Sample image block"

---

### Video: Intro Clip
#type video
#src "https://example.com/intro.mp4"
#width auto
#height auto
#caption "Sample video block"

---

### Boolean: Accept Terms
#type boolean
#required true
#onLabel "同意する"
#offLabel "同意しない"

---

### Section Header: Additional Notes
#type section_header
#title "追加情報"
#subtitle "必要に応じて補足を入力してください"
`;

export default function PlaygroundPage() {
  const { resolvedTheme } = useTheme();
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitPreviewOpen, setSubmitPreviewOpen] = useState(false);
  const [submittedPayloadJson, setSubmittedPayloadJson] = useState<string>("");

  const handleMarkdownChange = (nextMarkdown: string) => {
    if (nextMarkdown.trim().length === 0) {
      setMarkdown(DEFAULT_FORM_FRONTMATTER_MARKDOWN);
      return;
    }

    setMarkdown(nextMarkdown);
  };

  useEffect(() => {
    const parseMarkdown = async () => {
      const effectiveMarkdown =
        markdown.trim().length === 0
          ? DEFAULT_FORM_FRONTMATTER_MARKDOWN
          : markdown;

      try {
        const parsed = await parseMarkdownToForm(effectiveMarkdown);
        const parsedFormData = parsed as FormData;
        setFormData(parsedFormData);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to parse markdown";
        setError(message);
        setFormData(null);
        toast.error(message);
      }
    };

    const debounceTimer = setTimeout(parseMarkdown, 300);
    return () => clearTimeout(debounceTimer);
  }, [markdown]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">md2form Playground</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Write markdown on the right, see your form come to life on the left
              </p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 text-right">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-muted rounded border border-border font-mono">#</kbd>
                <span>Use after auto #type</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-muted rounded border border-border font-mono">↑↓</kbd>
                <span>Navigate suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-muted rounded border border-border font-mono">Tab</kbd>
                <span>or</span>
                <kbd className="px-2 py-0.5 bg-muted rounded border border-border font-mono">Enter</kbd>
                <span>Insert</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Form Preview */}
        <div className="flex-1 overflow-auto bg-muted/30 border-r border-border">
          <div className="p-8">
            {error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <h3 className="font-semibold text-destructive mb-2">Parse Error</h3>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            ) : formData ? (
              <FormRenderer
                formData={formData}
                onSubmit={(payload) => {
                  setSubmittedPayloadJson(JSON.stringify(payload, null, 2));
                  setSubmitPreviewOpen(true);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Loading preview...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Markdown Editor with Autocomplete */}
        <div className="flex-1 flex flex-col bg-background">
          <div className="flex-1 p-4">
            <MarkdownEditor value={markdown} onChange={handleMarkdownChange} />
          </div>
        </div>
      </div>

      <Dialog open={submitPreviewOpen} onOpenChange={setSubmitPreviewOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Submitted Payload (JSON)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border bg-background">
            <SyntaxHighlighter
              language="json"
              style={resolvedTheme === "dark" ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                background: "transparent",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
              showLineNumbers
            >
              {submittedPayloadJson}
            </SyntaxHighlighter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
