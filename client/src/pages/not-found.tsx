import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold font-mono tracking-wide">404</h1>
        <p className="text-xl font-medium">PAGE NOT FOUND</p>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button className="border-2 border-foreground mt-4" data-testid="button-home">
            <Home className="w-4 h-4 mr-2" />
            BACK TO DASHBOARD
          </Button>
        </Link>
      </div>
    </div>
  );
}
