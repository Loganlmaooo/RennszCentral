import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Form validation schema
const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  featured: z.boolean().default(false)
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export default function AnnouncementManager() {
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement, setFeaturedAnnouncement } = useAnnouncements();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      featured: false
    }
  });
  
  const onSubmit = async (data: AnnouncementFormValues) => {
    try {
      if (isEditing && currentId !== null) {
        // Update existing announcement
        await updateAnnouncement(currentId, data);
        toast({
          title: "Success",
          description: "Announcement updated successfully.",
          variant: "default"
        });
      } else {
        // Create new announcement
        await createAnnouncement(data);
        toast({
          title: "Success",
          description: "Announcement created successfully.",
          variant: "default"
        });
      }
      
      // Reset form and editing state
      reset();
      setIsEditing(false);
      setCurrentId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save announcement. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleEdit = (id: number) => {
    const announcement = announcements?.find(a => a.id === id);
    if (announcement) {
      setValue("title", announcement.title);
      setValue("content", announcement.content);
      setValue("featured", announcement.featured);
      setIsEditing(true);
      setCurrentId(id);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteAnnouncement(id);
        toast({
          title: "Success",
          description: "Announcement deleted successfully.",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete announcement. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleFeature = async (id: number) => {
    try {
      await setFeaturedAnnouncement(id);
      toast({
        title: "Success",
        description: "Featured announcement updated successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update featured announcement. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setCurrentId(null);
    reset();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Announcements</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" /> New Announcement
          </button>
        )}
      </div>
      
      <div className="glass p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {isEditing ? (currentId ? "Edit Announcement" : "Create Announcement") : "Create/Edit Announcement"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Title</label>
            <input 
              type="text" 
              {...register("title")}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Content</label>
            <textarea 
              rows={5} 
              {...register("content")}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all resize-none"
            ></textarea>
            {errors.content && (
              <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Featured</label>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="featured" 
                {...register("featured")}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="featured">Make this announcement featured (displays on homepage)</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            {isEditing && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#D4AF37] text-primary font-medium rounded hover:bg-[#FFD700] transition-colors"
            >
              {isEditing ? (currentId ? "Update" : "Create") : "Save"} Announcement
            </button>
          </div>
        </form>
      </div>
      
      <div className="glass rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800">
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Featured</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements?.map(announcement => (
              <tr key={announcement.id} className="border-t border-gray-800">
                <td className="py-3 px-4">{announcement.title}</td>
                <td className="py-3 px-4">{format(new Date(announcement.date), 'MMM dd, yyyy')}</td>
                <td className="py-3 px-4">
                  {announcement.featured ? (
                    <span className="text-green-500"><FaCheck /></span>
                  ) : (
                    <span className="text-gray-500"><FaTimes /></span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => handleEdit(announcement.id)}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(announcement.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors mr-2"
                  >
                    <FaTrash />
                  </button>
                  {!announcement.featured && (
                    <button 
                      onClick={() => handleFeature(announcement.id)}
                      title="Set as featured"
                      className="p-1 text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                    >
                      ★
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {(!announcements || announcements.length === 0) && (
              <tr className="border-t border-gray-800">
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  No announcements found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
