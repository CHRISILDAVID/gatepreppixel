import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScheduleItem } from "@shared/schema";
import { Calendar } from "lucide-react";

export default function Schedule() {
  const { data: scheduleItems, isLoading } = useQuery<ScheduleItem[]>({
    queryKey: ["/api/schedule"],
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: number }) => {
      return apiRequest("PATCH", `/api/schedule/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
    },
  });

  const handleCompletedChange = (item: ScheduleItem, checked: boolean) => {
    updateScheduleMutation.mutate({
      id: item.id,
      completed: checked ? 1 : 0,
    });
  };

  const groupedByWeek = scheduleItems?.reduce((acc, item) => {
    if (!acc[item.week]) {
      acc[item.week] = [];
    }
    acc[item.week].push(item);
    return acc;
  }, {} as Record<number, ScheduleItem[]>);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-2xl font-mono tracking-wide">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Calendar className="w-8 h-8" />
        <h1 className="text-3xl font-bold tracking-wide" data-testid="text-schedule-title">
          STUDY SCHEDULE
        </h1>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByWeek || {}).map(([week, items]) => {
          const completedCount = items.filter((i) => i.completed).length;

          return (
            <div key={week}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold tracking-wide" data-testid={`text-week-${week}`}>
                  WEEK {week}
                </h2>
                <span className="text-sm font-mono" data-testid={`text-week-${week}-progress`}>
                  {completedCount}/{items.length} COMPLETED
                </span>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="border-2 border-foreground"
                    data-testid={`schedule-item-${item.id}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
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
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
