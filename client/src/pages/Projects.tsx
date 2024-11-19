import { useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle, Loader2, ArrowLeft, SaveAll } from "lucide-react";
import useSWR from "swr";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { ErrorBoundary } from "@/components/error-boundary";

type Project = {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectFormData = {
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
};

type ApiError = {
  message: string;
};

async function fetchProjects(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || data.message || 'Request failed');
  }

  return response.json();
}

export default function Projects() {
  const [, setLocation] = useLocation();
  const { data: projects, error: projectsError, mutate } = useSWR<Project[], ApiError>(
    '/api/projects',
    fetchProjects,
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
      onError: (error) => {
        console.error("[Projects] Failed to fetch projects:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch projects. Please try again.",
          variant: "destructive",
        });
      }
    }
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, boolean>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  const [projectNotes, setProjectNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const initialFormData: ProjectFormData = {
    name: '',
    description: '',
    status: 'draft',
  };

  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError("Project name is required");
      return false;
    }
    if (formData.name.length > 100) {
      setFormError("Project name must be less than 100 characters");
      return false;
    }
    if (formData.description && formData.description.length > 500) {
      setFormError("Description must be less than 500 characters");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleNotesChange = (projectId: string, value: string) => {
    setProjectNotes({
      ...projectNotes,
      [projectId]: value
    });
  };

  const handleSaveNotes = async (projectId: string) => {
    try {
      setSavingNotes(prev => ({ ...prev, [projectId]: true }));
      const notes = projectNotes[projectId];

      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save notes');
      }

      await mutate();
      setEditingNotes(prev => ({ ...prev, [projectId]: false }));
      
      toast({
        title: "Success",
        description: "Notes saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setSavingNotes(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const response = await fetch(
        selectedProject ? `/api/projects/${selectedProject.id}` : '/api/projects',
        {
          method: selectedProject ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Operation failed');
      }

      await mutate();
      setIsDialogOpen(false);
      setSelectedProject(null);
      setFormData(initialFormData);
      
      toast({
        title: selectedProject ? "Project updated" : "Project created",
        description: `Successfully ${selectedProject ? 'updated' : 'created'} project "${formData.name}"`,
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      await mutate();
      toast({
        title: "Project deleted",
        description: "Successfully deleted the project",
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
    });
    setFormError(null);
    setIsDialogOpen(true);
  };

  if (projectsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900 p-8">
        <div className="container mx-auto">
          <Alert variant="destructive" className="backdrop-blur-xl bg-white/5 border-white/10">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {projectsError.message || 'Failed to load projects. Please try again later.'}
            </AlertDescription>
            <Button 
              className="mt-4 hover:bg-white/10"
              onClick={() => mutate()}
            >
              Retry
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  if (!projects) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900 p-8">
        <div className="container mx-auto flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-white/60 mb-4" />
          <p className="text-white/60">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#2a0066] to-slate-900 p-8">
      <div className="container mx-auto">
        <ErrorBoundary>
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setLocation('/project-backup')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
              >
                <SaveAll className="mr-2 h-4 w-4" />
                Backup/Export
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                  setSelectedProject(null);
                  setFormData(initialFormData);
                  setFormError(null);
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-xl bg-slate-900/90 border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {selectedProject ? 'Edit Project' : 'Create New Project'}
                    </DialogTitle>
                    <DialogDescription className="text-white/70">
                      Fill out the details below to {selectedProject ? 'update' : 'create'} your project.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        disabled={isSubmitting}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Enter project name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        disabled={isSubmitting}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Enter project description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-white">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: 'draft' | 'published' | 'archived') =>
                          setFormData({ ...formData, status: value })
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                          <SelectItem value="draft" className="text-white">Draft</SelectItem>
                          <SelectItem value="published" className="text-white">Published</SelectItem>
                          <SelectItem value="archived" className="text-white">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {selectedProject ? 'Updating...' : 'Creating...'}
                        </div>
                      ) : (
                        selectedProject ? 'Update Project' : 'Create Project'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2 text-white">No projects yet</h2>
              <p className="text-white/60 mb-4">Create your first project to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">{project.name}</CardTitle>
                    <CardDescription className="text-white/60">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/80">{project.description}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${project.status === 'published' ? 'bg-green-500/20 text-green-200' :
                          project.status === 'archived' ? 'bg-gray-500/20 text-gray-200' :
                            'bg-blue-500/20 text-blue-200'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`notes-${project.id}`} className="text-white mb-2">Notes</Label>
                      <Textarea
                        id={`notes-${project.id}`}
                        value={projectNotes[project.id] ?? project.notes ?? ''}
                        onChange={(e) => handleNotesChange(project.id, e.target.value)}
                        placeholder="Add notes about this project..."
                        className="bg-white/5 text-white border-white/20"
                        disabled={savingNotes[project.id]}
                      />
                      <Button
                        onClick={() => handleSaveNotes(project.id)}
                        className="mt-2 bg-white/10 hover:bg-white/20 text-white"
                        disabled={savingNotes[project.id]}
                      >
                        {savingNotes[project.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Notes'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(project)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
