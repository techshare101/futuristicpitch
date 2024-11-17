import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GetStarted() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Product Pitch Generator!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Your First Project</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Start by creating a new project to organize your product pitches.</p>
            <Link href="/projects">
              <Button>Go to Projects</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate a Pitch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Ready to create your first product pitch? Use our AI-powered generator.</p>
            <Link href="/generator">
              <Button>Start Generating</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
