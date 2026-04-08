"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResponseAnswer {
  question_key?: string;
  question_type?: string;
  title?: string;
  answer?: unknown;
  signed_url?: string | null;
}

interface ResponseRow {
  id: string;
  submitted_at: string;
  answers_json: ResponseAnswer[];
  metadata: {
    ip?: string;
    userAgent?: string;
  } | null;
}

interface FormResponsesViewProps {
  formId: string;
  cachedResponses?: ResponseRow[] | null;
  onResponsesLoaded?: (responses: ResponseRow[]) => void;
}

interface QuestionGroup {
  key: string;
  title: string;
  questionType: string;
  entries: Array<{
    responseId: string;
    submittedAt: string;
    answer: ResponseAnswer;
  }>;
}

function displayAnswer(answer: ResponseAnswer) {
  if (answer.question_type === "signature") {
    if (answer.signed_url) {
      return (
        <a
          href={answer.signed_url}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2"
        >
          View signature
        </a>
      );
    }

    return <span className="text-muted-foreground">No signature</span>;
  }

  if (Array.isArray(answer.answer)) {
    return <span>{answer.answer.join(", ") || "(empty)"}</span>;
  }

  if (answer.answer && typeof answer.answer === "object") {
    return <pre className="text-xs">{JSON.stringify(answer.answer, null, 2)}</pre>;
  }

  if (typeof answer.answer === "boolean") {
    return <span>{answer.answer ? "true" : "false"}</span>;
  }

  return <span>{typeof answer.answer === "string" ? answer.answer : "(empty)"}</span>;
}

export function FormResponsesView({
  formId,
  cachedResponses = null,
  onResponsesLoaded,
}: FormResponsesViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [selectedQuestionKey, setSelectedQuestionKey] = useState<string>("");
  const [individualIndex, setIndividualIndex] = useState(0);

  useEffect(() => {
    if (cachedResponses) {
      setResponses(cachedResponses);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/forms/${formId}/responses`, {
        cache: "no-store",
      });
      const json = await response.json().catch(() => null);

      if (!active) {
        return;
      }

      if (!response.ok) {
        setError(json?.error || "Failed to load responses.");
        setLoading(false);
        return;
      }

      const nextResponses = Array.isArray(json?.responses) ? json.responses : [];
      setResponses(nextResponses);
      onResponsesLoaded?.(nextResponses);
      setLoading(false);
    }

    load().catch((err: unknown) => {
      if (!active) {
        return;
      }

      const message = err instanceof Error ? err.message : "Failed to load responses.";
      setError(message);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [cachedResponses, formId, onResponsesLoaded]);

  const questionGroups = useMemo<QuestionGroup[]>(() => {
    const groups = new Map<string, QuestionGroup>();

    for (const response of responses) {
      if (!Array.isArray(response.answers_json)) {
        continue;
      }

      response.answers_json.forEach((answer, index) => {
        const key = answer.question_key || answer.title || `question-${index + 1}`;
        const title = answer.title || answer.question_key || `Question ${index + 1}`;
        const questionType = answer.question_type || "unknown";

        if (!groups.has(key)) {
          groups.set(key, {
            key,
            title,
            questionType,
            entries: [],
          });
        }

        const group = groups.get(key);
        if (!group) {
          return;
        }

        group.entries.push({
          responseId: response.id,
          submittedAt: response.submitted_at,
          answer,
        });
      });
    }

    return Array.from(groups.values());
  }, [responses]);

  useEffect(() => {
    if (questionGroups.length === 0) {
      setSelectedQuestionKey("");
      return;
    }

    const exists = questionGroups.some((group) => group.key === selectedQuestionKey);
    if (!exists) {
      setSelectedQuestionKey(questionGroups[0].key);
    }
  }, [questionGroups, selectedQuestionKey]);

  useEffect(() => {
    if (responses.length === 0) {
      setIndividualIndex(0);
      return;
    }

    if (individualIndex > responses.length - 1) {
      setIndividualIndex(responses.length - 1);
    }
  }, [individualIndex, responses]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Loading responses...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Responses unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
      </Card>
    );
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          No responses yet.
        </CardContent>
      </Card>
    );
  }

  const selectedQuestion =
    questionGroups.find((group) => group.key === selectedQuestionKey) || questionGroups[0] || null;
  const selectedResponse = responses[individualIndex] || null;

  return (
    <Tabs defaultValue="summary" className="space-y-4">
      <TabsList className="mx-auto grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="question">Question</TabsTrigger>
        <TabsTrigger value="individual">Individual</TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="space-y-4">
        {questionGroups.map((group) => (
          <Card key={group.key}>
            <CardHeader>
              <CardTitle className="text-base">{group.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {group.entries.length} answers · {group.questionType}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.entries.map((entry) => (
                  <div
                    key={`${group.key}-${entry.responseId}`}
                    className="border-border/70 space-y-1 rounded-md border px-3 py-2"
                  >
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.submittedAt).toLocaleString()}
                    </p>
                    <div className="text-sm">{displayAnswer(entry.answer)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="question" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Question view</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionGroups.length > 0 ? (
              <>
                <Select value={selectedQuestion?.key} onValueChange={setSelectedQuestionKey}>
                  <SelectTrigger className="max-w-xl">
                    <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionGroups.map((group) => (
                      <SelectItem key={group.key} value={group.key}>
                        {group.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedQuestion ? (
                  <div className="space-y-3">
                    {selectedQuestion.entries.map((entry) => (
                      <div
                        key={`${selectedQuestion.key}-${entry.responseId}`}
                        className="border-border/70 space-y-1 rounded-md border px-3 py-2"
                      >
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.submittedAt).toLocaleString()}
                        </p>
                        <div className="text-sm">{displayAnswer(entry.answer)}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No question data available.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="individual" className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center gap-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIndividualIndex((prev) => Math.max(prev - 1, 0))}
              disabled={individualIndex <= 0}
              aria-label="Previous response"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm tabular-nums">
              {individualIndex + 1} of {responses.length}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIndividualIndex((prev) => Math.min(prev + 1, responses.length - 1))}
              disabled={individualIndex >= responses.length - 1}
              aria-label="Next response"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {selectedResponse && (
          <Card key={selectedResponse.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {new Date(selectedResponse.submitted_at).toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.isArray(selectedResponse.answers_json) && selectedResponse.answers_json.length > 0 ? (
                selectedResponse.answers_json.map((answer, index) => (
                  <div
                    key={`${selectedResponse.id}-${answer.question_key || index}`}
                    className="space-y-1"
                  >
                    <p className="text-sm font-medium">
                      {answer.title || answer.question_key || `Question ${index + 1}`}
                    </p>
                    <div className="text-sm text-muted-foreground">{displayAnswer(answer)}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No answer data.</p>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
