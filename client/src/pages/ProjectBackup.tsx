import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Loader2, ArrowLeft, Download, Upload, AlertCircle } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";

export default function ProjectBackup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/projects/export');
      
      if (!response.ok) {
        throw new Error('Failed to export projects');
      }

      const data = await response.json();
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projects-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Successfully exported ${data.projects.length} projects`,
      });
    } catch (error) {
      console.error('[ProjectBackup] Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export projects",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsImporting(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          const response = await fetch('/api/projects/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Failed to import projects');
          }

          const result = await response.json();
          
          toast({
            title: "Import Successful",
            description: `Successfully imported ${result.results.succeeded} projects (${result.results.failed} failed)`,
          });

          // Reset file input
          event.target.value = '';
        } catch (error) {
          console.error('[ProjectBackup] Import error:', error);
          toast({
            title: "Import Failed",
            description: error instanceof Error ? error.message : "Failed to import projects",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('[ProjectBackup] Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import projects",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900 p-8">
      <div className="container mx-auto">
        <ErrorBoundary>
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => setLocation('/projects')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-xl bg-white/5 border-white/10 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Project Backup</CardTitle>
                <CardDescription className="text-white/60">
                  Export your projects or restore from a backup file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Export Projects</h3>
                  <p className="text-white/60">
                    Download all your projects as a JSON file for backup
                  </p>
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export Projects
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Import Projects</h3>
                  <p className="text-white/60">
                    Restore projects from a backup file
                  </p>
                  <div className="grid w-full items-center gap-4">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      disabled={isImporting}
                      className="bg-white/10 text-white border-white/20"
                    />
                  </div>
                  {isImporting && (
                    <div className="flex items-center justify-center text-white/60">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </div>
                  )}
                </div>

                <Alert className="bg-white/5 border-white/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-white">Important</AlertTitle>
                  <AlertDescription className="text-white/60">
                    Make sure to keep your backup files secure. Imported projects will be added to your existing projects.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
