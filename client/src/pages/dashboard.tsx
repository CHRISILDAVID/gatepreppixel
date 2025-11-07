import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { StudySession } from "@shared/schema";
import { format } from "date-fns";
import { Clock, BookOpen, Target } from "lucide-react";

export default function Dashboard() {
  const { data: sessions, isLoading } = useQuery<StudySession[]>({
    queryKey: ["/api/sessions"],
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const todaySessions = sessions?.filter((s) => s.date === today) || [];
  const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  const uniqueTopics = new Set(todaySessions.map((s) => s.subject).filter(Boolean));

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-2xl font-mono tracking-wide">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-1 tracking-wide" data-testid="text-dashboard-title">
          DAILY REPORT
        </h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM dd, yyyy")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-2 border-foreground" data-testid="card-total-hours">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm mb-2 font-medium">TOTAL HOURS</p>
              <p className="text-4xl font-bold tracking-wide">
                {totalHours}h {remainingMinutes}m
              </p>
            </div>
            <Clock className="w-6 h-6 mt-1" />
          </div>
        </Card>

        <Card className="p-4 border-2 border-foreground" data-testid="card-sessions">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm mb-2 font-medium">SESSIONS</p>
              <p className="text-4xl font-bold tracking-wide">{todaySessions.length}</p>
            </div>
            <BookOpen className="w-6 h-6 mt-1" />
          </div>
        </Card>

        <Card className="p-4 border-2 border-foreground" data-testid="card-topics-covered">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm mb-2 font-medium">TOPICS COVERED</p>
              <p className="text-4xl font-bold tracking-wide">{uniqueTopics.size}</p>
            </div>
            <Target className="w-6 h-6 mt-1" />
          </div>
        </Card>
      </div>

      <Card className="p-4 border-2 border-foreground">
        <h2 className="text-lg font-bold mb-3 tracking-wide">TODAY'S SESSIONS</h2>
        {todaySessions.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center border-2 border-dashed border-foreground">
            NO SESSIONS LOGGED TODAY
          </p>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className="border-2 border-foreground p-3"
                data-testid={`session-${session.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{session.subject || "General Study"}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.startTime} - {session.endTime || "Ongoing"}
                    </p>
                  </div>
                  <p className="font-bold text-sm">{session.duration} MIN</p>
                </div>
                {session.notes && (
                  <p className="text-sm mt-2 border-t-2 border-foreground pt-2">{session.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
