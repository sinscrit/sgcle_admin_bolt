import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Project } from "../lib/types";
import { createProject, updateProject, fetchClients, type Client } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Combobox } from "./ui/combobox";

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Client is required"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      client_id: project?.client_id || "",
    },
  });

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await fetchClients();
        setClients(data);
      } catch (error) {
        console.error("Failed to load clients:", error);
      } finally {
        setIsLoadingClients(false);
      }
    }
    loadClients();
  }, []);

  const clientId = watch("client_id");

  const onSubmit = async (data: ProjectFormData) => {
    console.log('Submitting project data:', data);
    try {
      if (project) {
        console.log('Updating project:', project.id, data);
        const updatedProject = await updateProject(project.id, data);
        console.log('Project updated:', updatedProject);
      } else {
        console.log('Creating new project:', data);
        const newProject = await createProject(data);
        console.log('Project created:', newProject);
      }
      onSuccess();
    } catch (error) {
      console.error("Failed to save project:", error);
      // You might want to show an error message to the user here
    }
  };

  const clientOptions = clients.map((client) => ({
    label: client.client_name || 'Unnamed Client',
    value: client.client_id,
    image: client.client_logo
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Project name"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Client</Label>
        <Combobox
          options={clientOptions}
          value={clientId}
          onValueChange={(value) => setValue("client_id", value)}
          placeholder={isLoadingClients ? "Loading clients..." : "Select a client"}
          emptyText="No clients found"
        />
        {errors.client_id && (
          <p className="text-sm text-red-500">{errors.client_id.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Project description (optional)"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoadingClients}>
          {project ? "Update" : "Create"} Project
        </Button>
      </div>
    </form>
  );
} 