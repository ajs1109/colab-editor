"use client";

import TextEditor from "@/components/TextEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { CreateProjectModal } from "./CreateProjectModal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/apiClient";
import { projects } from "@/utils/projects";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { successBtnStyles } from "../commonStyles";
import { cn } from "@/lib/utils";

interface ValidateProjectNameProps {
  valid: boolean;
  message: string;
}

export function NewProjectForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [readme, setReadme] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState<ValidateProjectNameProps>({valid: false, message: "Project name is required"});
  const [isCheckingUniqueness, setIsCheckingUniqueness] = useState(false);
  const router = useRouter();

  // Convert invalid characters to valid repository name
  const sanitizeProjectName = (input: string): string => {
    let sanitized = input.replace(/[^a-zA-Z0-9-_]/g, "-");

    sanitized = sanitized.replace(/^[-_]+|[-_]+$/g, "");

    sanitized = sanitized.replace(/[-_]+/g, "-");

    return sanitized;
  };

  // Validate project name format
  const validateProjectName = (name: string): ValidateProjectNameProps => {
    let response: ValidateProjectNameProps = {valid: false, message: ""};
    const sanitized = sanitizeProjectName(name);

    if (!name.trim()) 
      response.message = "Project name is required";

    else if (name.length < 3) 
      response.message = "Project name must be at least 3 characters long";

    else if (name.length > 50) 
      response.message = "Project name must be less than 50 characters";

    else if (!sanitized) 
      response.message = "Project name cannot be empty after removing invalid characters";

    else if (sanitized !== name) {
      response.message = "Project name will be: " + sanitized;
      response.valid = true;
    }

    else response.valid = true;

    return response;
  };

  // Check if project name is unique for the user
  const checkProjectNameUniqueness = async (
    projectName: string,
    userId: string
  ): Promise<boolean> => {
    try {
      setIsCheckingUniqueness(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .ilike("name", projectName.toLowerCase())
        .eq("user_id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        // No rows returned, name is unique
        return true;
      }

      return !data; // If data exists, name is not unique
    } catch (error) {
      console.error("Error checking name uniqueness:", error);
      return false;
    } finally {
      setIsCheckingUniqueness(false);
    }
  };

  // Debounced name validation with live uniqueness checking
  useEffect(() => {
    if (!name) {
      setNameError({valid: false, message: "Project name is required"});
      return;
    }

    // Immediate format validation
    const formatError = validateProjectName(name);
    setNameError(formatError);

    if (!formatError.valid) 
      return;

    // Debounced uniqueness check
    const timeoutId = setTimeout(async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const sanitized = sanitizeProjectName(name);

        if (session) {
          const isUnique = await checkProjectNameUniqueness(
            sanitized,
            session.user.id
          );

          if (!isUnique) 
            setNameError({valid: false, message: "A project with this name already exists"});
          else if(sanitized !== name)
            setNameError({valid: true, message: `Project name will be: ${sanitized}`});
          else
            setNameError({valid: true, message: "Project name is Available"});

        }
      } catch (error) {
        console.error("Error during validation:", error);
        setNameError({valid: false, message: "Error checking project name"});
      }
    }, 300); // Reduced delay for faster feedback

    return () => clearTimeout(timeoutId);
  }, [name]);

  const handleCreateProject = async () => {
    // Use sanitized name for creation
    const sanitizedName = sanitizeProjectName(name);

    // Validate sanitized name
    const formatError = validateProjectName(sanitizedName);
    if (formatError) {
      setNameError(formatError);
      return;
    }

    try {
      setIsCreating(true);
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Final uniqueness check with sanitized name
      const isUnique = await checkProjectNameUniqueness(
        sanitizedName,
        session.user.id
      );
      if (!isUnique) {
        setNameError({valid: false, message: "A project with this name already exists"});
        return;
      }

      const projectData: ProjectWithOptions = {
        name: sanitizedName,
        description,
        readme,
        is_public: visibility === "public",
      };

      const project = await projects.management.create(
        projectData as ProjectWithOptions,
        session.user.id
      );

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create project. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1 max-w-full">

          <Label className="text-xs">Project name</Label>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Name of project"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className= "max-w-96"
            />
        </div>

        {!isCheckingUniqueness && <p className={cn("text-xs mt-1", nameError.valid ? "text-green-600" : "text-red-500")}>{nameError.message}</p>}

        {isCheckingUniqueness && (
          <p className="text-xs text-muted-foreground mt-1">
            Checking availability...
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1">
          Only letters, numbers, hyphens, and underscores allowed. Invalid
          characters will be replaced with hyphens.
        </p>
      </div>

      <div className="space-y-1 max-w-[28rem]">
        <Label className="text-xs">Short description (Optional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          placeholder="A short description about this project"
          rows={3}
        />
      </div>

      <div className="space-y-3">
        <Label className="text-xs">Visibility</Label>
        <RadioGroup
          value={visibility}
          onValueChange={setVisibility}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="public" id="public" className="mt-1" />
            <div className="space-y-1">
              <Label
                htmlFor="public"
                className="text-sm font-medium cursor-pointer"
              >
                Public
              </Label>
              <p className="text-xs text-muted-foreground">
                Anyone on the internet can see this project. You choose who can
                commit.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="private" id="private" className="mt-1" />
            <div className="space-y-1">
              <Label
                htmlFor="private"
                className="text-sm font-medium cursor-pointer"
              >
                Private
              </Label>
              <p className="text-xs text-muted-foreground">
                You choose who can see and commit to this project.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-1 max-w-[40rem]">
        <Label className="text-xs">README</Label>
        <TextEditor
          content=""
          onChange={(text) => setReadme(text)}
          isEditable
        />
      </div>

      <Button
        onClick={handleCreateProject}
        className={cn(successBtnStyles, "w-28")}
        disabled={
          isCreating ||
          isCheckingUniqueness ||
          !validateProjectName(sanitizeProjectName(name)).valid
        }
      >
        {isCreating ? "Creating..." : "Create"}
      </Button>
    </div>
  );
}
