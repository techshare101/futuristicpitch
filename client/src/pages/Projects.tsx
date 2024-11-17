import { useState } from "react";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import useSWR from "swr";
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
import { useToast } from "@/hooks/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useLocation } from "wouter";

type Project = {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
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

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export default function Projects() {
  const [, setLocation] = useLocation();
  const { data: projects, error: projectsError, mutate } = useSWR<Project[], ApiError>(
    '/api/projects',
    fetchWithAuth,
    {
      onError: (error) => {
        if (error.message.includes('Unauthorized')) {
          setLocation('/login');
        }
      },
      revalidateOnFocus: true,
      refreshInterval: 30000,
    }
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const response = await fetchWithAuth(
        selectedProject ? `/api/projects/${selectedProject.id}` : '/api/projects',
        {
          method: selectedProject ? 'PUT' : 'POST',
          body: JSON.stringify(formData),
        }
      );

      if (!response) {
        throw new Error('Failed to create project');
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
      await fetchWithAuth(`/api/projects/${id}`, {
        method: 'DELETE',
      });

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

      if (errorMessage.includes('Unauthorized')) {
        setLocation('/login');
      }
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
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {projectsError.message || 'Failed to load projects. Please try again later.'}
          </AlertDescription>
          <Button 
            className="mt-4"
            onClick={() => mutate()}
          >
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!projects) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-white/60">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedProject(null);
            setFormData(initialFormData);
            setFormError(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
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
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2 text-white">No projects yet</h2>
          <p className="text-white/60 mb-4">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="backdrop-blur-xl bg-white/5 border-white/10">
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
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEditDialog(project)}
                  className="hover:bg-white/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(project.id)}
                  className="hover:bg-white/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
