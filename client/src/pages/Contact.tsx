import { Navbar } from "@/components/layout/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMessageSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Phone, Mail, Loader2 } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof insertMessageSchema>) => {
      const res = await fetch(api.contact.submit.path, {
        method: api.contact.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
    },
    onSuccess: () => {
      toast({ title: "Message Sent", description: "We'll get back to you shortly." });
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h1 className="text-4xl font-display font-bold mb-6">Get in Touch</h1>
            <p className="text-muted-foreground text-lg mb-8">
              Have questions about a vehicle or need financing? Our team is here to help you drive away happy.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Visit Us</h3>
                  <p className="text-muted-foreground">123 Auto Drive, Motor City, MC 48201</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Call Us</h3>
                  <p className="text-muted-foreground">(555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Email Us</h3>
                  <p className="text-muted-foreground">sales@automarket.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => sendMessage(data))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="I'm interested in..." className="min-h-[150px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full btn-primary" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
