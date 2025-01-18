import { useEffect, useState } from 'react';
import { Project } from '../lib/types';
import { fetchProjects, deleteProject, fetchClients, type Client } from '../lib/api';
import ProjectForm from './ProjectForm';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projectsData, clientsData] = await Promise.all([
        fetchProjects(),
        fetchClients(),
      ]);
      console.log('Projects loaded:', projectsData);
      console.log('Clients loaded:', clientsData);
      setProjects(projectsData);
      setClients(clientsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      console.error('Error loading data:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDelete = async (project: Project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;

    try {
      await deleteProject(selectedProject.id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setSelectedProject(null);
    await loadData();
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.client_id === clientId);
    return client?.client_name || 'Unknown Client';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading projects...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => loadData()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500">
            {projects.length} project{projects.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500">No projects found.</p>
          <p className="text-sm text-gray-400 mt-2">Click "Add Project" to create one.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {projects.map((project) => {
              const client = clients.find(c => c.client_id === project.client_id);
              console.log('Rendering project:', project, 'with client:', client);
              return (
                <li key={project.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-blue-600">{project.name}</h3>
                        <div className="mt-1 flex items-center gap-2">
                          {client?.client_logo && (
                            <img
                              src={client.client_logo}
                              alt={client.client_name || ''}
                              className="h-5 w-5 object-contain"
                            />
                          )}
                          <p className="text-xs text-gray-500">
                            {client?.client_name || 'No Client Assigned'}
                            {client?.client_city && ` (${client.client_city})`}
                          </p>
                        </div>
                        {project.description && (
                          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(project)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Create/Edit Project Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? 'Edit Project' : 'Create Project'}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={selectedProject || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedProject(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{selectedProject?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}