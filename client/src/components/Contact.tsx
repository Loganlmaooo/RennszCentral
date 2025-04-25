import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });
  
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would send the form data to a server
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon.",
        variant: "default"
      });
      
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="contact" className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
            <span className="gold-gradient">Get in</span> Touch
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Have questions or business inquiries? Reach out to us directly.
          </p>
        </div>
        
        <div className="glass max-w-4xl mx-auto rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block mb-2 font-medium">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  {...register("name")}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-medium">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  {...register("email")}
                  className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block mb-2 font-medium">Subject</label>
              <input 
                type="text" 
                id="subject" 
                {...register("subject")}
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="message" className="block mb-2 font-medium">Message</label>
              <textarea 
                id="message" 
                rows={5} 
                {...register("message")}
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all resize-none"
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-primary font-semibold rounded hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
