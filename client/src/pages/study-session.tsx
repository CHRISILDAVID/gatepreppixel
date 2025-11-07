import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Topic } from "@shared/schema";
import { Play, Pause, Square } from "lucide-react";
import { format } from "date-fns";

export default function StudySession() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");

  const { data: topics } = useQuery<Topic[]>({
    queryKey: ["/api/topics"],
  });

  const subjects = Array.from(new Set(topics?.map((t) => t.subject) || [])).sort();
  const filteredTopics = (topics?.filter((t) => t.subject === selectedSubject) || [])
    .sort((a, b) => a.number - b.number);

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({
        title: "SESSION SAVED",
        description: "Your study session has been logged successfully.",
      });
      setSeconds(0);
      setNotes("");
      setSelectedSubject("");
      setSelectedTopic("");
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    if (!isRunning) {
      setStartTime(format(new Date(), "HH:mm"));
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    if (seconds === 0) {
      toast({
        title: "NO TIME LOGGED",
        description: "Please start the timer before stopping.",
        variant: "destructive",
      });
      return;
    }

    const endTime = format(new Date(), "HH:mm");
    const duration = Math.floor(seconds / 60);

    createSessionMutation.mutate({
      date: format(new Date(), "yyyy-MM-dd"),
      startTime,
      endTime,
      duration,
      subject: selectedSubject || null,
      topicId: selectedTopic || null,
      notes: notes || null,
      imageProof: null,
    });

    setIsRunning(false);
  };

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const displaySeconds = seconds % 60;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-wide" data-testid="text-study-session-title">
          STUDY SESSION
        </h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM dd, yyyy")}</p>
      </div>

      <Card className="p-6 border-2 border-foreground">
        <div className="text-center mb-6">
          <div
            className="text-6xl md:text-7xl font-bold tracking-wide mb-4 font-mono"
            data-testid="text-timer-display"
          >
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
            {String(displaySeconds).padStart(2, "0")}
          </div>
          <div className="flex justify-center gap-2">
            {!isRunning && seconds === 0 && (
              <Button
                onClick={handleStart}
                className="border-2 border-foreground"
                data-testid="button-start-timer"
              >
                <Play className="w-4 h-4 mr-2" />
                START
              </Button>
            )}
            {isRunning && (
              <Button
                onClick={handlePause}
                variant="secondary"
                className="border-2 border-foreground"
                data-testid="button-pause-timer"
              >
                <Pause className="w-4 h-4 mr-2" />
                PAUSE
              </Button>
            )}
            {!isRunning && seconds > 0 && (
              <Button
                onClick={handleStart}
                className="border-2 border-foreground"
                data-testid="button-resume-timer"
              >
                <Play className="w-4 h-4 mr-2" />
                RESUME
              </Button>
            )}
            {seconds > 0 && (
              <Button
                onClick={handleStop}
                variant="destructive"
                className="border-2 border-foreground"
                data-testid="button-stop-timer"
              >
                <Square className="w-4 h-4 mr-2" />
                STOP & SAVE
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t-2 border-foreground pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject" className="text-sm font-bold mb-2 block">
                SUBJECT
              </Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger
                  id="subject"
                  className="border-2 border-foreground"
                  data-testid="select-subject"
                >
                  <SelectValue placeholder="SELECT SUBJECT" />
                </SelectTrigger>
                <SelectContent className="border-2 border-foreground">
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject} data-testid={`option-subject-${subject}`}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topic" className="text-sm font-bold mb-2 block">
                TOPIC (OPTIONAL)
              </Label>
              <Select
                value={selectedTopic}
                onValueChange={setSelectedTopic}
                disabled={!selectedSubject}
              >
                <SelectTrigger
                  id="topic"
                  className="border-2 border-foreground"
                  data-testid="select-topic"
                >
                  <SelectValue placeholder="SELECT TOPIC" />
                </SelectTrigger>
                <SelectContent className="border-2 border-foreground">
                  {filteredTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id} data-testid={`option-topic-${topic.id}`}>
                      {topic.topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-bold mb-2 block">
              NOTES
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your study session..."
              className="border-2 border-foreground min-h-24"
              data-testid="input-notes"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
