
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ListPlus } from "lucide-react";

const listFormSchema = z.object({
  name: z.string().min(3, "List name must be at least 3 characters.").max(100, "List name must be 100 characters or less."),
  description: z.string().max(500, "Description must be 500 characters or less.").optional(),
  isPublic: z.boolean().default(true),
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
      isPublic: true,
    },
  });

  function onSubmit(data: ListFormValues) {
    // In a real app, you'd send this to your backend and update global state
    console.log("New list data:", data);
    // For now, we simulate adding to mock data by creating a new object
    // const newListId = `l${mockBookLists.length + 1}`; // This approach is not robust for real apps
    // const newList = { ...data, id: newListId, userId: 'currentUser', userName: 'Current User', books: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), likes:0 };
    // mockBookLists.push(newList); // This direct mutation won't work effectively without proper state management

    toast({
      title: "List Created!",
      description: `Your list "${data.name}" has been successfully created (simulated).`,
    });
    // For now, just redirect to the main lists page
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
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Make list public?
                      </FormLabel>
                      <FormDescription>
                        Public lists can be seen by others. Private lists are only visible to you.
                      </FormDescription>
                    </div>
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
