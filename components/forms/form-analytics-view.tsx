"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelinePoint {
  day: string;
  count: number;
}

interface DistributionEntry {
  question_key: string;
  question_title: string;
  question_type: string;
  values: Array<{ label: string; count: number }>;
}

interface NumericEntry {
  question_key: string;
  question_title: string;
  question_type: string;
  min: number;
  max: number;
  avg: number;
  count: number;
}

interface AnalyticsPayload {
  total_responses: number;
  timeline: TimelinePoint[];
  distribution: DistributionEntry[];
  numeric: NumericEntry[];
}

interface FormAnalyticsViewProps {
  formId: string;
  cachedPayload?: AnalyticsPayload | null;
  onPayloadLoaded?: (payload: AnalyticsPayload) => void;
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 210 90% 56%))",
  "hsl(var(--chart-3, 155 70% 45%))",
  "hsl(var(--chart-4, 42 95% 55%))",
  "hsl(var(--chart-5, 10 85% 60%))",
  "hsl(var(--muted-foreground))",
];

const PIE_FRIENDLY_TYPES = new Set(["radio", "dropdown", "boolean"]);

export function FormAnalyticsView({
  formId,
  cachedPayload = null,
  onPayloadLoaded,
}: FormAnalyticsViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<AnalyticsPayload | null>(null);
  const [hideZeroOptions, setHideZeroOptions] = useState(true);

  useEffect(() => {
    if (cachedPayload) {
      setPayload(cachedPayload);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/forms/${formId}/analytics`, {
        cache: "no-store",
      });
      const json = await response.json().catch(() => null);

      if (!active) {
        return;
      }

      if (!response.ok) {
        setError(json?.error || "Failed to load analytics.");
        setLoading(false);
        return;
      }

      setPayload(json);
      onPayloadLoaded?.(json);
      setLoading(false);
    }

    load().catch((err: unknown) => {
      if (!active) {
        return;
      }

      const message =
        err instanceof Error ? err.message : "Failed to load analytics.";
      setError(message);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [cachedPayload, formId, onPayloadLoaded]);

  const totalResponses = useMemo(() => {
    if (!payload) {
      return 0;
    }

    return payload.total_responses;
  }, [payload]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  if (error || !payload) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {error || "No analytics found."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total responses</CardTitle>
        </CardHeader>
        <CardContent className="text-3xl font-semibold">{totalResponses}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily trend</CardTitle>
        </CardHeader>
        <CardContent>
          {payload.timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No responses yet.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payload.timeline} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payload.distribution.length === 0 ? (
            <p className="text-sm text-muted-foreground">No distribution data yet.</p>
          ) : (
            payload.distribution.map((entry) => (
              <div key={entry.question_key} className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold">{entry.question_title}</p>
                <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                  {entry.question_type.replaceAll("_", " ")}
                </p>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {entry.values.reduce((sum, item) => sum + item.count, 0)} responses
                  </p>
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={hideZeroOptions}
                      onChange={(event) => setHideZeroOptions(event.target.checked)}
                    />
                    Hide 0-count options
                  </label>
                </div>

                {(() => {
                  const chartValues = hideZeroOptions
                    ? entry.values.filter((item) => item.count > 0)
                    : entry.values;

                  if (chartValues.length === 0) {
                    return <p className="text-sm text-muted-foreground">No responses yet.</p>;
                  }

                  if (PIE_FRIENDLY_TYPES.has(entry.question_type)) {
                    return (
                      <div className="grid gap-3 lg:grid-cols-[0.65fr_0.35fr]">
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip />
                              <Pie
                                data={chartValues}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                outerRadius={85}
                              >
                                {chartValues.map((item, index) => (
                                  <Cell
                                    key={`${entry.question_key}:${item.label}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-1 text-sm">
                          {chartValues.map((item, index) => (
                            <div
                              key={`${entry.question_key}:legend:${item.label}`}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="flex items-center gap-2 truncate">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{
                                    backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                                  }}
                                />
                                <span className="truncate">{item.label}</span>
                              </span>
                              <span className="text-muted-foreground">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartValues}
                          layout="vertical"
                          margin={{ top: 0, right: 12, left: 12, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis type="number" allowDecimals={false} fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="label"
                            width={160}
                            fontSize={12}
                            interval={0}
                          />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })()}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Numeric stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {payload.numeric.length === 0 ? (
            <p className="text-sm text-muted-foreground">No numeric stats yet.</p>
          ) : (
            payload.numeric.map((entry) => (
              <div key={entry.question_key} className="rounded border border-border p-3 text-sm">
                <p className="font-medium">{entry.question_title}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {entry.question_type.replaceAll("_", " ")}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                  <p>min {entry.min}</p>
                  <p>max {entry.max}</p>
                  <p>avg {entry.avg.toFixed(2)}</p>
                  <p>n {entry.count}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
