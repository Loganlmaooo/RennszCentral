import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaCheck, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const themeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
  backgroundType: z.enum(["color", "gradient", "image"]),
  backgroundValue: z.string().min(1, "Background value is required"),
  headingFont: z.string().min(1, "Heading font is required"),
  bodyFont: z.string().min(1, "Body font is required"),
  isActive: z.boolean().default(false)
});

type ThemeFormValues = z.infer<typeof themeSchema>;

export default function ThemeSettings() {
  const { themes, activeTheme, createTheme, updateTheme, deleteTheme, setActiveTheme } = useTheme();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<number | null>(null);
  const [previewTheme, setPreviewTheme] = useState<ThemeFormValues | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ThemeFormValues>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      name: "",
      primaryColor: "#111111",
      secondaryColor: "#222222",
      accentColor: "#D4AF37",
      textColor: "#FFFFFF",
      backgroundType: "image",
      backgroundValue: "https://images.unsplash.com/photo-1533134486753-c833f0ed4866",
      headingFont: "Montserrat",
      bodyFont: "Poppins",
      isActive: false
    }
  });
  
  // Watch all form values for preview
  const watchedValues = watch();
  
  // Update preview when form values change
  useEffect(() => {
    setPreviewTheme(watchedValues);
  }, [watchedValues]);
  
  // Set form values when editing
  const handleEdit = (id: number) => {
    const theme = themes?.find(t => t.id === id);
    if (theme) {
      setValue("name", theme.name);
      setValue("primaryColor", theme.primaryColor);
      setValue("secondaryColor", theme.secondaryColor);
      setValue("accentColor", theme.accentColor);
      setValue("textColor", theme.textColor);
      setValue("backgroundType", theme.backgroundType as any);
      setValue("backgroundValue", theme.backgroundValue);
      setValue("headingFont", theme.headingFont);
      setValue("bodyFont", theme.bodyFont);
      setValue("isActive", theme.isActive);
      
      setEditingThemeId(id);
      setIsCreating(true);
    }
  };
  
  // Reset form and state
  const cancelEdit = () => {
    reset();
    setEditingThemeId(null);
    setIsCreating(false);
    setPreviewTheme(null);
  };
  
  // Save theme (create or update)
  const onSubmit = async (data: ThemeFormValues) => {
    try {
      if (editingThemeId !== null) {
        await updateTheme(editingThemeId, data);
        toast({
          title: "Theme Updated",
          description: "The theme has been updated successfully.",
          variant: "default"
        });
      } else {
        await createTheme(data);
        toast({
          title: "Theme Created",
          description: "The new theme has been created successfully.",
          variant: "default"
        });
      }
      
      // Reset form and state
      cancelEdit();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Delete theme
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this theme?")) {
      try {
        await deleteTheme(id);
        toast({
          title: "Theme Deleted",
          description: "The theme has been deleted successfully.",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete theme. You cannot delete the active theme.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Set active theme
  const handleSetActive = async (id: number) => {
    try {
      await setActiveTheme(id);
      toast({
        title: "Theme Activated",
        description: "The theme has been set as active.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set active theme. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Theme Settings</h1>
      
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="glass p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Current Theme</h3>
          {activeTheme ? (
            <div className="p-4 bg-gray-800 rounded flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded overflow-hidden mr-4" 
                  style={{
                    background: activeTheme.backgroundType === 'gradient' 
                      ? activeTheme.backgroundValue 
                      : `linear-gradient(to bottom right, ${activeTheme.primaryColor}, ${activeTheme.accentColor})`
                  }}
                ></div>
                <div>
                  <h4 className="font-semibold">{activeTheme.name}</h4>
                  <p className="text-gray-400 text-sm">Active theme</p>
                </div>
              </div>
              <span className="text-green-500"><FaCheck /></span>
            </div>
          ) : (
            <div className="p-4 bg-gray-800 rounded">
              <p className="text-gray-400 text-center">No active theme found</p>
            </div>
          )}
        </div>
        
        <div className="glass p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Theme Presets</h3>
          <div className="space-y-3">
            {themes?.filter(theme => !theme.isActive).map(theme => (
              <div 
                key={theme.id}
                className="p-3 bg-gray-800 rounded flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded overflow-hidden mr-3" 
                    style={{
                      background: theme.backgroundType === 'gradient' 
                        ? theme.backgroundValue 
                        : `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.accentColor})`
                    }}
                  ></div>
                  <span>{theme.name}</span>
                </div>
                <button 
                  onClick={() => handleSetActive(theme.id)}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  Apply
                </button>
              </div>
            ))}
            
            {(!themes || themes.filter(theme => !theme.isActive).length === 0) && (
              <p className="text-gray-400 text-center p-3">No theme presets available</p>
            )}
          </div>
        </div>
        
        <div className="glass p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Custom Theme</h3>
          <button 
            onClick={() => {
              setIsCreating(true);
              setEditingThemeId(null);
              reset();
            }}
            className="w-full p-3 bg-[#D4AF37] text-primary rounded font-medium hover:bg-[#FFD700] transition-colors"
          >
            Create New Theme
          </button>
        </div>
      </div>
      
      {isCreating && (
        <div className="glass p-6 rounded-lg mb-8">
          <h3 className="text-xl font-semibold mb-4">
            {editingThemeId ? "Edit Theme" : "Create New Theme"}
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block mb-2 font-medium">Theme Name</label>
                  <input 
                    type="text" 
                    {...register("name")} 
                    className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
                    placeholder="e.g. Premium Dark"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Color Palette</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Primary Color</label>
                      <div className="flex">
                        <input 
                          type="color" 
                          {...register("primaryColor")} 
                          className="bg-gray-800 border border-gray-700 rounded-l w-12 h-10"
                        />
                        <input 
                          type="text" 
                          {...register("primaryColor")} 
                          className="flex-grow p-2 bg-gray-800 rounded-r border border-gray-700 border-l-0 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      {errors.primaryColor && (
                        <p className="mt-1 text-xs text-red-500">{errors.primaryColor.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Secondary Color</label>
                      <div className="flex">
                        <input 
                          type="color" 
                          {...register("secondaryColor")} 
                          className="bg-gray-800 border border-gray-700 rounded-l w-12 h-10"
                        />
                        <input 
                          type="text" 
                          {...register("secondaryColor")} 
                          className="flex-grow p-2 bg-gray-800 rounded-r border border-gray-700 border-l-0 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      {errors.secondaryColor && (
                        <p className="mt-1 text-xs text-red-500">{errors.secondaryColor.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Accent Color</label>
                      <div className="flex">
                        <input 
                          type="color" 
                          {...register("accentColor")} 
                          className="bg-gray-800 border border-gray-700 rounded-l w-12 h-10"
                        />
                        <input 
                          type="text" 
                          {...register("accentColor")} 
                          className="flex-grow p-2 bg-gray-800 rounded-r border border-gray-700 border-l-0 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      {errors.accentColor && (
                        <p className="mt-1 text-xs text-red-500">{errors.accentColor.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Text Color</label>
                      <div className="flex">
                        <input 
                          type="color" 
                          {...register("textColor")} 
                          className="bg-gray-800 border border-gray-700 rounded-l w-12 h-10"
                        />
                        <input 
                          type="text" 
                          {...register("textColor")} 
                          className="flex-grow p-2 bg-gray-800 rounded-r border border-gray-700 border-l-0 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      {errors.textColor && (
                        <p className="mt-1 text-xs text-red-500">{errors.textColor.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Background</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Background Type</label>
                      <div className="relative inline-block w-full">
                        <select 
                          {...register("backgroundType")} 
                          className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none transition-all appearance-none"
                        >
                          <option value="color">Solid Color</option>
                          <option value="gradient">Gradient</option>
                          <option value="image">Image</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                      {errors.backgroundType && (
                        <p className="mt-1 text-xs text-red-500">{errors.backgroundType.message}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm text-gray-400">Background Value</label>
                      <input 
                        type="text" 
                        {...register("backgroundValue")} 
                        className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none"
                        placeholder={
                          watch("backgroundType") === "color" ? "#000000" :
                          watch("backgroundType") === "gradient" ? "linear-gradient(90deg, #111111, #D4AF37)" :
                          "https://example.com/image.jpg"
                        }
                      />
                      {errors.backgroundValue && (
                        <p className="mt-1 text-xs text-red-500">{errors.backgroundValue.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Typography</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Heading Font</label>
                      <div className="relative inline-block w-full">
                        <select 
                          {...register("headingFont")} 
                          className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none transition-all appearance-none"
                        >
                          <option value="Montserrat">Montserrat</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Oswald">Oswald</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                      {errors.headingFont && (
                        <p className="mt-1 text-xs text-red-500">{errors.headingFont.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-gray-400">Body Font</label>
                      <div className="relative inline-block w-full">
                        <select 
                          {...register("bodyFont")} 
                          className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none transition-all appearance-none"
                        >
                          <option value="Poppins">Poppins</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Lato">Lato</option>
                          <option value="Roboto">Roboto</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                      {errors.bodyFont && (
                        <p className="mt-1 text-xs text-red-500">{errors.bodyFont.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    {...register("isActive")} 
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="isActive">Set as active theme</label>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button 
                    type="button" 
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-[#D4AF37] text-primary font-medium rounded hover:bg-[#FFD700] transition-colors"
                  >
                    {editingThemeId ? "Update" : "Save"} Theme
                  </button>
                </div>
              </form>
            </div>
            
            {/* Theme Preview */}
            <div>
              <h4 className="font-medium mb-3">Preview</h4>
              {previewTheme && (
                <div 
                  className="w-full h-64 rounded-lg overflow-hidden p-4 flex flex-col justify-between"
                  style={{
                    background: previewTheme.backgroundType === 'image' 
                      ? `url(${previewTheme.backgroundValue}) center/cover no-repeat` 
                      : previewTheme.backgroundType === 'gradient'
                        ? previewTheme.backgroundValue
                        : previewTheme.backgroundValue,
                    fontFamily: previewTheme.bodyFont,
                    color: previewTheme.textColor
                  }}
                >
                  <div>
                    <h5 
                      style={{ 
                        fontFamily: previewTheme.headingFont,
                        background: `linear-gradient(90deg, ${previewTheme.accentColor} 0%, ${previewTheme.accentColor}88 50%, ${previewTheme.accentColor} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                      className="text-xl font-bold"
                    >
                      {previewTheme.name}
                    </h5>
                    <p>Theme preview example</p>
                  </div>
                  
                  <div 
                    className="rounded p-2 mt-2"
                    style={{
                      background: `${previewTheme.primaryColor}88`,
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${previewTheme.accentColor}50`
                    }}
                  >
                    <p className="text-sm">Glass effect preview</p>
                  </div>
                  
                  <button 
                    style={{
                      background: `linear-gradient(to right, ${previewTheme.accentColor}, ${previewTheme.accentColor}aa)`,
                      color: previewTheme.primaryColor
                    }}
                    className="self-end px-3 py-1 rounded text-sm font-medium mt-2"
                  >
                    Button Example
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {!isCreating && (
        <div className="glass p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Manage Themes</h3>
          <div className="space-y-4">
            {themes?.map(theme => (
              <div key={theme.id} className="p-4 bg-gray-800 rounded flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded overflow-hidden mr-3"
                    style={{
                      background: theme.backgroundType === 'gradient' 
                        ? theme.backgroundValue 
                        : `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.accentColor})`
                    }}
                  ></div>
                  <div>
                    <h4 className="font-medium">{theme.name}</h4>
                    <p className="text-sm text-gray-400">
                      {theme.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(theme.id)}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Edit Theme"
                  >
                    <FaEdit />
                  </button>
                  
                  {!theme.isActive && (
                    <>
                      <button 
                        onClick={() => handleSetActive(theme.id)}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors"
                        title="Set as Active"
                      >
                        <FaCheck />
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(theme.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Theme"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {(!themes || themes.length === 0) && (
              <div className="p-6 text-center text-gray-400">
                <p>No themes found. Create a theme to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
