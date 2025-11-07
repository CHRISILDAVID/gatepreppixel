import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Reference } from "@shared/schema";
import { Search, ExternalLink, FileText, Video, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function References() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: references, isLoading } = useQuery<Reference[]>({
    queryKey: ["/api/references"],
  });

  const subjects = Array.from(new Set(references?.map((r) => r.syllabusSection) || []));
  const types = Array.from(new Set(references?.map((r) => r.resourceType) || []));

  const filteredReferences = references?.filter((ref) => {
    const matchesSearch =
      searchQuery === "" ||
      ref.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.titleDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === "all" || ref.syllabusSection === selectedSubject;
    const matchesType = selectedType === "all" || ref.resourceType === selectedType;

    return matchesSearch && matchesSubject && matchesType;
  });

  const getIcon = (type: string) => {
    if (type.toLowerCase() === "video") return <Video className="w-4 h-4" />;
    if (type.toLowerCase() === "github" || type.toLowerCase() === "gist")
      return <Github className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

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
        <h1 className="text-3xl font-bold tracking-wide mb-1" data-testid="text-references-title">
          QUICK REFERENCES
        </h1>
        <p className="text-sm text-muted-foreground">{references?.length || 0} resources available</p>
      </div>

      <Card className="p-4 border-2 border-foreground">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="SEARCH TOPICS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-foreground"
              data-testid="input-search"
            />
          </div>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="border-2 border-foreground" data-testid="select-subject-filter">
              <SelectValue placeholder="ALL SUBJECTS" />
            </SelectTrigger>
            <SelectContent className="border-2 border-foreground">
              <SelectItem value="all">ALL SUBJECTS</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="border-2 border-foreground" data-testid="select-type-filter">
              <SelectValue placeholder="ALL TYPES" />
            </SelectTrigger>
            <SelectContent className="border-2 border-foreground">
              <SelectItem value="all">ALL TYPES</SelectItem>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {filteredReferences?.length === 0 ? (
        <Card className="p-8 border-2 border-foreground text-center">
          <p className="text-muted-foreground">NO REFERENCES FOUND</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredReferences?.map((ref) => (
            <Card key={ref.id} className="border-2 border-foreground" data-testid={`reference-${ref.id}`}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="border-2 border-foreground gap-1"
                        data-testid={`badge-type-${ref.id}`}
                      >
                        {getIcon(ref.resourceType)}
                        {ref.resourceType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{ref.syllabusSection}</span>
                    </div>
                    <p className="font-bold text-sm mb-1">{ref.topic}</p>
                    <p className="text-sm">{ref.titleDescription}</p>
                  </div>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                    data-testid={`link-reference-${ref.id}`}
                  >
                    <ExternalLink className="w-5 h-5 hover-elevate" />
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
