"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ListPlus } from "lucide-react";

const listFormSchema = z.object({
  name: z.string().min(3, "List name must be at least 3 characters.").max(100, "List name must be 100 characters or less."),
  description: z.string().max(500, "Description must be 500 characters or less.").optional(),
});

type ListFormValues = z.infer<typeof listFormSchema>;

export default function NewListPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(data: ListFormValues) {
    // In a real app, you'd send this to your backend
    console.log("New list data:", data);
    toast({
      title: "List Created!",
      description: `Your list "${data.name}" has been successfully created.`,
    });
    // For now, just redirect to the main lists page
    // In a real app, you might redirect to the newly created list's page: router.push(`/lists/new-list-id`);
    router.push("/lists"); 
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <ListPlus className="h-7 w-7 text-primary" />
            <CardTitle className="font-headline text-3xl">Create a New Book List</CardTitle>
          </div>
          <CardDescription>Organize your books into custom collections.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Reads, Sci-Fi Favorites" {...field} />
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of what this list is about."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full md:w-auto transition-transform hover:scale-105" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create List"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
