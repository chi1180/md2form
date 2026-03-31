"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShortTextField } from "@/components/form-elements/short-text-field";
import { LongTextField } from "@/components/form-elements/long-text-field";
import { EmailField } from "@/components/form-elements/email-field";
import { NumberField } from "@/components/form-elements/number-field";
import { PhoneField } from "@/components/form-elements/phone-field";
import { RadioField } from "@/components/form-elements/radio-field";
import { CheckboxField } from "@/components/form-elements/checkbox-field";
import { BooleanField } from "@/components/form-elements/boolean-field";
import { DropdownField } from "@/components/form-elements/dropdown-field";
import { DateField } from "@/components/form-elements/date-field";
import { TimeField } from "@/components/form-elements/time-field";
import { MatrixField } from "@/components/form-elements/matrix-field";
import { ScaleField } from "@/components/form-elements/scale-field";
import { RatingField } from "@/components/form-elements/rating-field";
import { LikertField } from "@/components/form-elements/likert-field";
import { FileUploadField } from "@/components/form-elements/file-upload-field";
import { SignatureField } from "@/components/form-elements/signature-field";
import { ImageField } from "@/components/form-elements/image-field";
import { VideoField } from "@/components/form-elements/video-field";
import { SectionHeaderField } from "@/components/form-elements/section-header-field";
import {
  type FormElement,
  type ResponseValue,
} from "@/components/form-elements/types";

interface FormPage {
  id: string;
  title?: string;
  description?: string;
  elements: FormElement[];
}

export interface FormData {
  id: string;
  title: string;
  description?: string;
  pages: FormPage[];
  settings?: {
    collectEmail?: boolean;
    showProgressBar?: boolean;
  };
}

interface FormRendererProps {
  formData: FormData;
  onSubmit?: (payload: {
    formId: string;
    title: string;
    submittedAt: string;
    responses: Array<{
      pageIndex: number;
      elementIndex: number;
      type: string;
      answer: ResponseValue | undefined;
      [key: string]: unknown;
    }>;
  }) => void;
}

export function FormRenderer({ formData, onSubmit }: FormRendererProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});

  const currentPage = formData.pages[currentPageIndex];
  const totalPages = formData.pages.length;
  const isLastPage = currentPageIndex === totalPages - 1;
  const isFirstPage = currentPageIndex === 0;

  const handleInputChange = (elementId: string, value: ResponseValue) => {
    setResponses((prev) => ({ ...prev, [elementId]: value }));
  };

  const handlePrevious = () => {
    if (!isFirstPage) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const getResponseKeyByPosition = (
    pageIndex: number,
    element: FormElement,
    index: number,
  ) => element.id || `page-${pageIndex}-element-${index}`;

  const getResponseKey = (element: FormElement, index: number) =>
    getResponseKeyByPosition(currentPageIndex, element, index);

  const getFieldId = (element: FormElement, index: number) =>
    element.id || `field-${currentPageIndex}-${index}`;

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPage) {
      toast.error("No form page available.");
      return;
    }

    const submittedData = new FormData(event.currentTarget);
    const nextResponses = { ...responses };
    let hasMissingRequiredCustomField = false;

    currentPage.elements.forEach((element, index) => {
      const responseKey = getResponseKey(element, index);

      if (element.type === "checkbox") {
        const checkboxValues = submittedData.getAll(responseKey).map(String);
        const fallbackValues = Array.isArray(responses[responseKey])
          ? responses[responseKey]
          : [];
        const values =
          checkboxValues.length > 0 ? checkboxValues : fallbackValues;

        nextResponses[responseKey] = values;

        if (element.required && values.length === 0) {
          hasMissingRequiredCustomField = true;
        }

        if (
          typeof element.minSelected === "number" &&
          values.length < element.minSelected
        ) {
          hasMissingRequiredCustomField = true;
        }

        if (
          typeof element.maxSelected === "number" &&
          values.length > element.maxSelected
        ) {
          hasMissingRequiredCustomField = true;
        }

        return;
      }

      if (element.type === "matrix") {
        const rows = Array.isArray(element.rows) ? element.rows : [];
        const rowValues: Record<string, string[] | string> = {};

        rows.forEach((row) => {
          const rowKey = `${responseKey}:${row}`;
          const values = submittedData.getAll(rowKey).map(String);
          if (element.cellType === "checkbox") {
            rowValues[row] = values;
          } else {
            rowValues[row] = values[0] || "";
          }

          if (element.requiredPerRow && values.length === 0) {
            hasMissingRequiredCustomField = true;
          }
        });

        nextResponses[responseKey] = rowValues;

        if (element.required && rows.length > 0) {
          const hasAny = rows.some((row) => {
            const rowValue = rowValues[row];
            return Array.isArray(rowValue)
              ? rowValue.length > 0
              : rowValue.trim().length > 0;
          });
          if (!hasAny) {
            hasMissingRequiredCustomField = true;
          }
        }

        return;
      }

      if (element.type === "likert") {
        const statements = element.statements || [];
        const rowValues: Record<string, string[] | string> = {};

        statements.forEach((statement) => {
          const rowKey = `${responseKey}:${statement}`;
          const values = submittedData.getAll(rowKey).map(String);
          rowValues[statement] = element.requiredPerStatement
            ? values[0] || ""
            : values;

          if (element.requiredPerStatement && values.length === 0) {
            hasMissingRequiredCustomField = true;
          }
        });

        nextResponses[responseKey] = rowValues;

        if (element.required && statements.length > 0) {
          const hasAny = statements.some((statement) => {
            const rowValue = rowValues[statement];
            return Array.isArray(rowValue)
              ? rowValue.length > 0
              : rowValue.trim().length > 0;
          });
          if (!hasAny) {
            hasMissingRequiredCustomField = true;
          }
        }

        return;
      }

      if (element.type === "rating") {
        const rawValue = submittedData.get(responseKey);
        const parsedValue = rawValue?.toString() || "";

        if (element.required && parsedValue.trim().length === 0) {
          hasMissingRequiredCustomField = true;
          return;
        }

        const numericValue = Number(parsedValue);
        const maxScale = typeof element.scale === "number" ? element.scale : 5;
        if (
          parsedValue.length > 0 &&
          (Number.isNaN(numericValue) || numericValue < 1 || numericValue > maxScale)
        ) {
          hasMissingRequiredCustomField = true;
          return;
        }

        nextResponses[responseKey] = parsedValue;
        return;
      }

      if (element.type === "scale") {
        const rawValue = submittedData.get(responseKey);
        const parsedValue = rawValue?.toString() || "";

        if (element.required && parsedValue.trim().length === 0) {
          hasMissingRequiredCustomField = true;
          return;
        }

        const numericValue = Number(parsedValue);
        if (parsedValue.length > 0 && Number.isNaN(numericValue)) {
          hasMissingRequiredCustomField = true;
          return;
        }

        if (typeof element.min === "number" && numericValue < element.min) {
          hasMissingRequiredCustomField = true;
          return;
        }

        if (typeof element.max === "number" && numericValue > element.max) {
          hasMissingRequiredCustomField = true;
          return;
        }

        nextResponses[responseKey] = parsedValue;
        return;
      }

      if (element.type === "file_upload") {
        const files = submittedData.getAll(responseKey).filter((item) => item instanceof File) as File[];

        if (element.required && files.length === 0) {
          hasMissingRequiredCustomField = true;
        }

        if (typeof element.maxFiles === "number" && files.length > element.maxFiles) {
          hasMissingRequiredCustomField = true;
        }

        if (typeof element.maxSizeMB === "number") {
          const totalSize = files.reduce((sum, file) => sum + file.size, 0);
          if (totalSize > element.maxSizeMB * 1024 * 1024) {
            hasMissingRequiredCustomField = true;
          }
        }

        nextResponses[responseKey] = files;
        return;
      }

      if (element.type === "signature") {
        const uploadedFile = submittedData.get(responseKey);

        if (uploadedFile instanceof File && uploadedFile.size > 0) {
          nextResponses[responseKey] = uploadedFile;
          return;
        }

        const fallbackValue = responses[responseKey];
        if (typeof fallbackValue === "string") {
          if (element.required && fallbackValue.trim().length === 0) {
            hasMissingRequiredCustomField = true;
            return;
          }
          nextResponses[responseKey] = fallbackValue;
          return;
        }

        if (element.required) {
          hasMissingRequiredCustomField = true;
        }

        return;
      }

      if (element.type === "boolean") {
        const rawValue = submittedData.get(responseKey);
        const fallbackValue = responses[responseKey];

        let booleanValue: boolean | undefined;
        if (rawValue === "true") {
          booleanValue = true;
        } else if (rawValue === "false") {
          booleanValue = false;
        } else if (typeof fallbackValue === "boolean") {
          booleanValue = fallbackValue;
        }

        if (typeof booleanValue === "boolean") {
          nextResponses[responseKey] = booleanValue;
        }

        if (element.required && typeof booleanValue !== "boolean") {
          hasMissingRequiredCustomField = true;
        }

        return;
      }

      const rawValue = submittedData.get(responseKey);
      if (rawValue !== null) {
        const parsedValue = rawValue.toString();

        if (element.required && parsedValue.trim().length === 0) {
          hasMissingRequiredCustomField = true;
          return;
        }

        if (element.type === "number" && element.integerOnly) {
          const numericValue = Number(parsedValue);
          if (parsedValue.length > 0 && !Number.isInteger(numericValue)) {
            hasMissingRequiredCustomField = true;
            return;
          }
        }

        nextResponses[responseKey] = parsedValue;
      }
    });

    if (hasMissingRequiredCustomField) {
      toast.error("Please check required fields and validation rules.");
      return;
    }

    setResponses(nextResponses);

    if (!isLastPage) {
      setCurrentPageIndex((prev) => prev + 1);
      return;
    }

    const responseItems = formData.pages.flatMap((page, pageIndex) =>
      page.elements.map((element, elementIndex) => {
        const responseKey = getResponseKeyByPosition(pageIndex, element, elementIndex);
        return {
          pageIndex,
          elementIndex,
          ...element,
          type: element.type,
          answer: nextResponses[responseKey],
        };
      }),
    );

    const payload = {
      formId: formData.id,
      title: formData.title,
      submittedAt: new Date().toISOString(),
      responses: responseItems,
    };

    console.log("Form submitted:", payload);
    onSubmit?.(payload);
    toast.success("Form submitted successfully.");
  };

  const renderElement = (element: FormElement, index: number) => {
    const responseKey = getResponseKey(element, index);
    const fieldId = getFieldId(element, index);
    const questionTitle =
      element.description || element.title || "Untitled Question";
    const responseValue = responses[responseKey];
    const commonProps = {
      element,
      questionTitle,
      responseKey,
      fieldId,
      value: responseValue,
      onChange: (value: ResponseValue) => handleInputChange(responseKey, value),
    };

    switch (element.type) {
      case "short_text":
        return <ShortTextField key={`${responseKey}-container`} {...commonProps} />;

      case "long_text":
        return <LongTextField key={`${responseKey}-container`} {...commonProps} />;

      case "email":
        return <EmailField key={`${responseKey}-container`} {...commonProps} />;

      case "number":
        return <NumberField key={`${responseKey}-container`} {...commonProps} />;

      case "phone":
        return <PhoneField key={`${responseKey}-container`} {...commonProps} />;

      case "radio":
        return <RadioField key={`${responseKey}-container`} {...commonProps} />;

      case "checkbox":
        return <CheckboxField key={`${responseKey}-container`} {...commonProps} />;

      case "boolean":
        return <BooleanField key={`${responseKey}-container`} {...commonProps} />;

      case "dropdown":
        return <DropdownField key={`${responseKey}-container`} {...commonProps} />;

      case "date":
        return <DateField key={`${responseKey}-container`} {...commonProps} />;

      case "time":
        return <TimeField key={`${responseKey}-container`} {...commonProps} />;

      case "matrix":
        return <MatrixField key={`${responseKey}-container`} {...commonProps} />;

      case "rating":
        return <RatingField key={`${responseKey}-container`} {...commonProps} />;

      case "likert":
        return <LikertField key={`${responseKey}-container`} {...commonProps} />;

      case "scale":
        return <ScaleField key={`${responseKey}-container`} {...commonProps} />;

      case "file_upload":
        return <FileUploadField key={`${responseKey}-container`} {...commonProps} />;

      case "signature":
        return <SignatureField key={`${responseKey}-container`} {...commonProps} />;

      case "image":
        return <ImageField key={`${responseKey}-container`} {...commonProps} />;

      case "video":
        return <VideoField key={`${responseKey}-container`} {...commonProps} />;

      case "section_header":
        return <SectionHeaderField key={`${responseKey}-container`} {...commonProps} />;

      default:
        return (
          <div
            key={`${responseKey}-container`}
            className="p-4 bg-muted/50 rounded-md"
          >
            <p className="text-sm text-muted-foreground">
              Unsupported field type:{" "}
              <code className="font-mono">{element.type}</code>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-border shadow-sm">
        {totalPages === 0 && formData.title.length === 0 ? (
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">
              No form pages were found. Add form fields in Markdown to preview
              them here.
            </p>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">{formData.title}</CardTitle>
              {formData.description && (
                <CardDescription className="text-base">
                  {formData.description}
                </CardDescription>
              )}
              {formData.settings?.showProgressBar && totalPages > 1 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>
                      Page {currentPageIndex + 1} of {totalPages}
                    </span>
                    <span>
                      {Math.round(((currentPageIndex + 1) / totalPages) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${((currentPageIndex + 1) / totalPages) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {currentPage?.title && (
                  <div>
                    <h2 className="text-lg font-semibold">
                      {currentPage.title}
                    </h2>
                    {currentPage.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentPage.description}
                      </p>
                    )}
                  </div>
                )}

                {currentPage?.elements.map((element, index) =>
                  renderElement(element, index),
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t border-border">
                  <div>
                    {!isFirstPage && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                      >
                        Previous
                      </Button>
                    )}
                  </div>
                  {currentPage?.elements.length > 0 && (
                    <div>
                      {!isLastPage ? (
                        <Button type="submit">Next</Button>
                      ) : (
                        <Button type="submit">Submit</Button>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
