import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScheduleItem } from "@shared/schema";
import { Calendar, ChevronDown, ChevronRight } from "lucide-react";

export default function Schedule() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1])); // Week 1 expanded by default

  const { data: scheduleItems, isLoading } = useQuery<ScheduleItem[]>({
    queryKey: ["/api/schedule"],
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: number }) => {
      return apiRequest("PATCH", `/api/schedule/${id}`, { completed });
    },
    onMutate: async ({ id, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/schedule"] });
      
      // Snapshot the previous value
      const previousSchedule = queryClient.getQueryData<ScheduleItem[]>(["/api/schedule"]);
      
      // Optimistically update
      queryClient.setQueryData<ScheduleItem[]>(["/api/schedule"], (old) => 
        old?.map(item => item.id === id ? { ...item, completed } : item)
      );
      
      return { previousSchedule };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSchedule) {
        queryClient.setQueryData(["/api/schedule"], context.previousSchedule);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
    },
  });

  const handleCompletedChange = (item: ScheduleItem, checked: boolean) => {
    updateScheduleMutation.mutate({
      id: item.id,
      completed: checked ? 1 : 0,
    });
  };

  const toggleWeek = (week: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(week)) {
      newExpanded.delete(week);
    } else {
      newExpanded.add(week);
    }
    setExpandedWeeks(newExpanded);
  };

  const groupedByWeek = scheduleItems?.reduce((acc, item) => {
    if (!acc[item.week]) {
      acc[item.week] = [];
    }
    acc[item.week].push(item);
    return acc;
  }, {} as Record<number, ScheduleItem[]>);

  // Sort weeks and maintain original order of items within each week
  const sortedWeeks = Object.keys(groupedByWeek || {})
    .map(Number)
    .sort((a, b) => a - b);
  
  // Keep items in their original CSV order (don't re-sort them)
  if (groupedByWeek) {
    Object.keys(groupedByWeek).forEach(week => {
      // Items are already in the order they were inserted from CSV
      // We just need to make sure we don't re-sort them
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
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8" />
          <h1 className="text-3xl font-bold tracking-wide" data-testid="text-schedule-title">
            STUDY SCHEDULE
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (expandedWeeks.size === sortedWeeks.length) {
              setExpandedWeeks(new Set());
            } else {
              setExpandedWeeks(new Set(sortedWeeks));
            }
          }}
          className="border-2 border-foreground"
          data-testid="button-toggle-all-weeks"
        >
          {expandedWeeks.size === sortedWeeks.length ? "COLLAPSE ALL" : "EXPAND ALL"}
        </Button>
      </div>

      <div className="space-y-2">
        {sortedWeeks.map((week) => {
          const items = groupedByWeek![week];
          const completedCount = items.filter((i) => i.completed).length;
          const isExpanded = expandedWeeks.has(week);

          return (
            <Card key={week} className="border-2 border-foreground overflow-hidden">
              <button
                onClick={() => toggleWeek(week)}
                className="w-full p-4 flex items-center justify-between hover-elevate text-left"
                data-testid={`button-toggle-week-${week}`}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <h2 className="text-xl font-bold tracking-wide" data-testid={`text-week-${week}`}>
                    WEEK {week}
                  </h2>
                </div>
                <span className="text-sm font-mono" data-testid={`text-week-${week}-progress`}>
                  {completedCount}/{items.length} COMPLETED
                </span>
              </button>

              {isExpanded && (
                <div className="border-t-2 border-foreground">
                  <div className="space-y-0">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`p-4 ${index !== items.length - 1 ? 'border-b-2 border-foreground' : ''}`}
                        data-testid={`schedule-item-${item.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.completed === 1}
                            onCheckedChange={(checked) =>
                              handleCompletedChange(item, checked as boolean)
                            }
                            className="mt-1 border-2 border-foreground"
                            data-testid={`checkbox-schedule-${item.id}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-bold text-sm mb-1">{item.date}</p>
                                <p className="text-xs text-muted-foreground">{item.studyType}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-sm">{item.studyHours}</p>
                              </div>
                            </div>
                            <div className="border-t-2 border-foreground pt-2 mt-2">
                              <p className="text-sm">{item.topicsToCover}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
