import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudySession } from "@shared/schema";
import { format, subDays, parseISO } from "date-fns";
import { Clock, BookOpen, Target, Calendar, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<StudySession | null>(null);
  const { toast } = useToast();
  
  const { data: sessions, isLoading } = useQuery<StudySession[]>({
    queryKey: ["/api/sessions"],
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/sessions/${id}`, {});
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/sessions"] });
      
      // Snapshot the previous value
      const previousSessions = queryClient.getQueryData<StudySession[]>(["/api/sessions"]);
      
      // Optimistically remove the session from the list
      queryClient.setQueryData<StudySession[]>(["/api/sessions"], (old) =>
        old?.filter(session => session.id !== id) || []
      );
      
      // Close dialogs immediately for better UX
      setSessionToDelete(null);
      setSelectedSession(null);
      
      return { previousSessions };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(["/api/sessions"], context.previousSessions);
      }
      toast({
        title: "ERROR",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "SESSION DELETED",
        description: "The study session has been removed.",
      });
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  
  const todaySessions = sessions?.filter((s) => s.date === today) || [];
  const yesterdaySessions = sessions?.filter((s) => s.date === yesterday) || [];
  const allSessions = sessions || [];
  
  // Calculate stats for each period
  const calculateStats = (sessionList: StudySession[]) => {
    const totalMinutes = sessionList.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const uniqueTopics = new Set(sessionList.map((s) => s.subject).filter(Boolean));
    
    return {
      totalHours,
      remainingMinutes,
      sessionCount: sessionList.length,
      topicsCount: uniqueTopics.size,
    };
  };
  
  const todayStats = calculateStats(todaySessions);
  const yesterdayStats = calculateStats(yesterdaySessions);
  const allTimeStats = calculateStats(allSessions);

  const SessionCard = ({ session, onClick }: { session: StudySession; onClick: () => void }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full border-2 border-foreground p-3 hover-elevate text-left"
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
          <div className="text-sm mt-2 border-t-2 border-foreground pt-2 line-clamp-2 prose prose-sm max-w-none">
            <ReactMarkdown>{session.notes}</ReactMarkdown>
          </div>
        )}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSessionToDelete(session);
        }}
        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground border-2 border-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
        title="Delete session"
        data-testid={`delete-session-${session.id}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

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
          STUDY REPORTS
        </h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM dd, yyyy")}</p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 border-2 border-foreground">
          <TabsTrigger value="today" className="font-bold">TODAY</TabsTrigger>
          <TabsTrigger value="yesterday" className="font-bold">YESTERDAY</TabsTrigger>
          <TabsTrigger value="all" className="font-bold">ALL TIME</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-2 border-foreground" data-testid="card-total-hours-today">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">TOTAL HOURS</p>
                  <p className="text-4xl font-bold tracking-wide">
                    {todayStats.totalHours}h {todayStats.remainingMinutes}m
                  </p>
                </div>
                <Clock className="w-6 h-6 mt-1" />
              </div>
            </Card>

            <Card className="p-4 border-2 border-foreground" data-testid="card-sessions-today">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">SESSIONS</p>
                  <p className="text-4xl font-bold tracking-wide">{todayStats.sessionCount}</p>
                </div>
                <BookOpen className="w-6 h-6 mt-1" />
              </div>
            </Card>

            <Card className="p-4 border-2 border-foreground" data-testid="card-topics-covered-today">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">TOPICS COVERED</p>
                  <p className="text-4xl font-bold tracking-wide">{todayStats.topicsCount}</p>
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
                  <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() => setSelectedSession(session)}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="yesterday" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-2 border-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">TOTAL HOURS</p>
                  <p className="text-4xl font-bold tracking-wide">
                    {yesterdayStats.totalHours}h {yesterdayStats.remainingMinutes}m
                  </p>
                </div>
                <Clock className="w-6 h-6 mt-1" />
              </div>
            </Card>

            <Card className="p-4 border-2 border-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">SESSIONS</p>
                  <p className="text-4xl font-bold tracking-wide">{yesterdayStats.sessionCount}</p>
                </div>
                <BookOpen className="w-6 h-6 mt-1" />
              </div>
            </Card>

            <Card className="p-4 border-2 border-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">TOPICS COVERED</p>
                  <p className="text-4xl font-bold tracking-wide">{yesterdayStats.topicsCount}</p>
                </div>
                <Target className="w-6 h-6 mt-1" />
              </div>
            </Card>
          </div>

          <Card className="p-4 border-2 border-foreground">
            <h2 className="text-lg font-bold mb-3 tracking-wide">YESTERDAY'S SESSIONS</h2>
            {yesterdaySessions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center border-2 border-dashed border-foreground">
                NO SESSIONS LOGGED YESTERDAY
              </p>
            ) : (
              <div className="space-y-2">
                {yesterdaySessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() => setSelectedSession(session)}
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-2 border-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">TOTAL HOURS</p>
                  <p className="text-4xl font-bold tracking-wide">
                    {allTimeStats.totalHours}h {allTimeStats.remainingMinutes}m
                  </p>
                </div>
                <Clock className="w-6 h-6 mt-1" />
              </div>
            </Card>

            <Card className="p-4 border-2 border-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">TOTAL SESSIONS</p>
                  <p className="text-4xl font-bold tracking-wide">{allTimeStats.sessionCount}</p>
                </div>
                <BookOpen className="w-6 h-6 mt-1" />
              </div>
            </Card>

            <Card className="p-4 border-2 border-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-2 font-medium">TOPICS COVERED</p>
                  <p className="text-4xl font-bold tracking-wide">{allTimeStats.topicsCount}</p>
                </div>
                <Target className="w-6 h-6 mt-1" />
              </div>
            </Card>
          </div>

          <Card className="p-4 border-2 border-foreground">
            <h2 className="text-lg font-bold mb-3 tracking-wide">ALL SESSIONS</h2>
            {allSessions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center border-2 border-dashed border-foreground">
                NO SESSIONS LOGGED YET
              </p>
            ) : (
              <div className="space-y-2">
                {allSessions
                  .sort((a, b) => {
                    // Sort by date descending (newest first)
                    const dateCompare = b.date.localeCompare(a.date);
                    if (dateCompare !== 0) return dateCompare;
                    // If same date, sort by start time descending
                    return b.startTime.localeCompare(a.startTime);
                  })
                  .map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onClick={() => setSelectedSession(session)}
                    />
                  ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Details Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="border-2 border-foreground max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-wide">
              SESSION DETAILS
            </DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-foreground p-3">
                  <p className="text-xs text-muted-foreground mb-1">DATE</p>
                  <p className="font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(parseISO(selectedSession.date), "MMMM dd, yyyy")}
                  </p>
                </div>
                <div className="border-2 border-foreground p-3">
                  <p className="text-xs text-muted-foreground mb-1">DURATION</p>
                  <p className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {Math.floor(selectedSession.duration / 60)}h {selectedSession.duration % 60}m
                  </p>
                </div>
              </div>

              <div className="border-2 border-foreground p-3">
                <p className="text-xs text-muted-foreground mb-1">TIME</p>
                <p className="font-bold">
                  {selectedSession.startTime} - {selectedSession.endTime || "Ongoing"}
                </p>
              </div>

              <div className="border-2 border-foreground p-3">
                <p className="text-xs text-muted-foreground mb-1">SUBJECT</p>
                <p className="font-bold">{selectedSession.subject || "General Study"}</p>
              </div>

              {selectedSession.notes && (
                <div className="border-2 border-foreground p-3">
                  <p className="text-xs text-muted-foreground mb-2">NOTES</p>
                  <div className="text-sm prose prose-sm max-w-none">
                    <ReactMarkdown>{selectedSession.notes}</ReactMarkdown>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedSession(null)}
                  variant="outline"
                  className="flex-1 border-2 border-foreground"
                >
                  CLOSE
                </Button>
                <Button
                  onClick={() => {
                    setSessionToDelete(selectedSession);
                  }}
                  variant="destructive"
                  className="flex-1 border-2 border-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  DELETE
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <AlertDialogContent className="border-2 border-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold tracking-wide">
              DELETE SESSION?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to delete this study session? This action cannot be undone.
              {sessionToDelete && (
                <div className="mt-3 p-3 border-2 border-foreground bg-muted">
                  <p className="font-bold text-foreground">
                    {sessionToDelete.subject || "General Study"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(sessionToDelete.date), "MMM dd, yyyy")} • {sessionToDelete.duration} minutes
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-foreground">
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToDelete && deleteSessionMutation.mutate(sessionToDelete.id)}
              className="border-2 border-foreground bg-destructive hover:bg-destructive/90"
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
