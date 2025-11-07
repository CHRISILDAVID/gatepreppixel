import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Topic } from "@shared/schema";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function Confidence() {
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [localConfidence, setLocalConfidence] = useState<Record<string, number>>({});

  const { data: topics, isLoading } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  const updateTopicMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/topics/${id}`, data);
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/topics"] });
      
      // Snapshot the previous value
      const previousTopics = queryClient.getQueryData<Topic[]>(["/api/topics"]);
      
      // Optimistically update
      queryClient.setQueryData<Topic[]>(["/api/topics"], (old) => 
        old?.map(topic => topic.id === id ? { ...topic, ...data } : topic)
      );
      
      return { previousTopics };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTopics) {
        queryClient.setQueryData(["/api/topics"], context.previousTopics);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
    },
  });

  const toggleSubject = (subject: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subject)) {
      newExpanded.delete(subject);
    } else {
      newExpanded.add(subject);
    }
    setExpandedSubjects(newExpanded);
  };

  const handleCompletedChange = (topic: Topic, checked: boolean) => {
    updateTopicMutation.mutate({
      id: topic.id,
      data: {
        completed: checked ? 1 : 0,
        confidence: topic.confidence,
      },
    });
  };

  const handleConfidenceChange = useCallback((topicId: string, value: number[]) => {
    setLocalConfidence(prev => ({ ...prev, [topicId]: value[0] }));
  }, []);

  const handleConfidenceCommit = (topic: Topic, value: number[]) => {
    updateTopicMutation.mutate({
      id: topic.id,
      data: {
        completed: topic.completed,
        confidence: value[0],
      },
    });
  };

  const groupedTopics = topics?.reduce((acc, topic) => {
    if (!acc[topic.subject]) {
      acc[topic.subject] = [];
    }
    acc[topic.subject].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  // Sort topics by number within each subject
  if (groupedTopics) {
    Object.keys(groupedTopics).forEach(subject => {
      groupedTopics[subject].sort((a, b) => a.number - b.number);
    });
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-2xl font-mono tracking-wide">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wide" data-testid="text-confidence-title">
          MY CONFIDENCE
        </h1>
        <Button
          variant="outline"
          onClick={() => {
            if (expandedSubjects.size === Object.keys(groupedTopics || {}).length) {
              setExpandedSubjects(new Set());
            } else {
              setExpandedSubjects(new Set(Object.keys(groupedTopics || {})));
            }
          }}
          className="border-2 border-foreground"
          data-testid="button-toggle-all"
        >
          {expandedSubjects.size === Object.keys(groupedTopics || {}).length
            ? "COLLAPSE ALL"
            : "EXPAND ALL"}
        </Button>
      </div>

      <div className="space-y-2">
        {Object.entries(groupedTopics || {}).map(([subject, subjectTopics]) => {
          const isExpanded = expandedSubjects.has(subject);
          const completedCount = subjectTopics.filter((t) => t.completed).length;
          const avgConfidence =
            subjectTopics.reduce((sum, t) => sum + t.confidence, 0) / subjectTopics.length;

          return (
            <Card key={subject} className="border-2 border-foreground overflow-hidden">
              <button
                onClick={() => toggleSubject(subject)}
                className="w-full p-4 flex items-center justify-between hover-elevate text-left"
                data-testid={`button-toggle-${subject}`}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <span className="font-bold text-base tracking-wide">{subject}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span data-testid={`text-completed-${subject}`}>
                    {completedCount}/{subjectTopics.length} DONE
                  </span>
                  <span
                    className="font-mono"
                    data-testid={`text-avg-confidence-${subject}`}
                  >
                    AVG: {Math.round(avgConfidence)}%
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t-2 border-foreground">
                  {subjectTopics.map((topic) => {
                    const currentConfidence = localConfidence[topic.id] ?? topic.confidence;
                    return (
                      <div
                        key={topic.id}
                        className="p-4 border-b-2 border-foreground last:border-b-0"
                        data-testid={`topic-${topic.id}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <Checkbox
                            checked={topic.completed === 1}
                            onCheckedChange={(checked) =>
                              handleCompletedChange(topic, checked as boolean)
                            }
                            className="mt-1 border-2 border-foreground"
                            data-testid={`checkbox-topic-${topic.id}`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{topic.topic}</p>
                            <p className="text-xs text-muted-foreground">Topic #{topic.number}</p>
                          </div>
                        </div>
                        <div className="ml-7 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span>CONFIDENCE</span>
                            <span
                              className="font-bold"
                              data-testid={`text-confidence-${topic.id}`}
                            >
                              {currentConfidence}%
                            </span>
                          </div>
                          <Slider
                            value={[currentConfidence]}
                            onValueChange={(value) => handleConfidenceChange(topic.id, value)}
                            onValueCommit={(value) => handleConfidenceCommit(topic, value)}
                            max={100}
                            step={10}
                            className="cursor-pointer"
                            data-testid={`slider-confidence-${topic.id}`}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
