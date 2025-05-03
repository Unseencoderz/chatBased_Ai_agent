
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Project, TechStack } from "@/types";
import { createProject } from "@/lib/supabase";
import TechBadge from "./TechBadge";

const techOptions: TechStack[] = [
  "react",
  "vue",
  "angular",
  "svelte",
  "next",
  "node",
  "express",
  "nest",
  "django",
  "flask",
  "laravel",
  "spring",
  "firebase",
  "supabase",
  "mongodb",
  "postgres",
  "mysql",
  "graphql",
  "apollo",
  "tailwind",
  "bootstrap",
  "mui",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image_url: z.string().url().optional().or(z.literal("")),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  status: z.enum(["ongoing", "finished", "stopped"]),
  project_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  tech_stack: z.array(z.string()).min(1, "Select at least one technology"),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  userId: string;
  onSuccess?: (project: Project) => void;
}

const ProjectForm = ({ userId, onSuccess }: ProjectFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTech, setSelectedTech] = useState<TechStack[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      status: "ongoing",
      project_url: "",
      github_url: "",
      tech_stack: [],
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert Date objects to ISO strings and ensure tech_stack is properly typed
      const projectData = {
        ...values,
        user_id: userId,
        tech_stack: selectedTech as TechStack[],
        start_date: values.start_date ? values.start_date.toISOString() : undefined,
        end_date: values.end_date ? values.end_date.toISOString() : undefined,
      };
      
      const { data, error } = await createProject(projectData);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Project submitted successfully!",
        description: "Your project is now visible in the showcase.",
      });
      
      if (onSuccess && data && Array.isArray(data) && data[0]) {
        // Type assertion to handle the project correctly
        onSuccess(data[0] as unknown as Project);
      }
      
      form.reset();
      setSelectedTech([]);
    } catch (error: any) {
      toast({
        title: "Failed to submit project",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTechSelection = (tech: TechStack) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter((t) => t !== tech));
      form.setValue(
        "tech_stack",
        selectedTech.filter((t) => t !== tech)
      );
    } else {
      setSelectedTech([...selectedTech, tech]);
      form.setValue(
        "tech_stack",
        [...selectedTech, tech]
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                Provide a URL to an image of your project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span className="text-muted-foreground">
                            Pick a date
                          </span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span className="text-muted-foreground">
                            Pick a date
                          </span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="project_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://myproject.com" {...field} />
                </FormControl>
                <FormDescription>Live deployment URL (optional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="github_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/user/repo" {...field} />
                </FormControl>
                <FormDescription>Repository URL (optional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tech_stack"
          render={() => (
            <FormItem>
              <FormLabel>Technologies Used</FormLabel>
              <div className="border border-input rounded-md p-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTech.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No technologies selected
                    </p>
                  ) : (
                    selectedTech.map((tech) => (
                      <div
                        key={tech}
                        className="flex items-center bg-secondary rounded-full px-2.5 py-1 text-xs"
                        onClick={() => handleTechSelection(tech)}
                      >
                        <TechBadge tech={tech} />
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ✕
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {techOptions.map((tech) => (
                    <Button
                      key={tech}
                      type="button"
                      variant={selectedTech.includes(tech) ? "default" : "outline"}
                      className="text-xs justify-start h-8"
                      onClick={() => handleTechSelection(tech)}
                    >
                      <TechBadge tech={tech} />
                    </Button>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Project"}
        </Button>
      </form>
    </Form>
  );
};

export default ProjectForm;
