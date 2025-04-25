import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaEdit, FaTrash, FaCopy, FaPlus } from "react-icons/fa";
import { useStreams } from "@/hooks/useStreams";
import { useToast } from "@/hooks/use-toast";

// Form validation schema for stream settings
const streamSettingsSchema = z.object({
  featuredChannel: z.string().min(1, "Featured channel is required"),
  autoDetect: z.boolean().default(true),
  offlineBehavior: z.string().min(1, "Offline behavior is required")
});

type StreamSettingsFormValues = z.infer<typeof streamSettingsSchema>;

// Form validation schema for stream channels
const streamChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  url: z.string().url("Must be a valid URL"),
  displayName: z.string().min(1, "Display name is required"),
  type: z.string().min(1, "Channel type is required"),
  schedule: z.string().optional(),
  isMain: z.boolean().default(false)
});

type StreamChannelFormValues = z.infer<typeof streamChannelSchema>;

export default function StreamSettings() {
  const { 
    streamSettings, 
    streamChannels, 
    updateStreamSettings, 
    createStreamChannel, 
    updateStreamChannel, 
    deleteStreamChannel 
  } = useStreams();
  
  const { toast } = useToast();
  const [editingChannelId, setEditingChannelId] = useState<number | null>(null);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  
  // Form for stream settings
  const {
    register: registerSettings,
    handleSubmit: handleSubmitSettings,
    formState: { errors: settingsErrors },
    setValue: setSettingsValue,
    watch: watchSettings
  } = useForm<StreamSettingsFormValues>({
    resolver: zodResolver(streamSettingsSchema),
    defaultValues: {
      featuredChannel: streamSettings?.featuredChannel || "",
      autoDetect: streamSettings?.autoDetect || true,
      offlineBehavior: streamSettings?.offlineBehavior || "message"
    }
  });
  
  // Form for stream channels
  const {
    register: registerChannel,
    handleSubmit: handleSubmitChannel,
    formState: { errors: channelErrors },
    setValue: setChannelValue,
    reset: resetChannelForm
  } = useForm<StreamChannelFormValues>({
    resolver: zodResolver(streamChannelSchema),
    defaultValues: {
      name: "",
      url: "",
      displayName: "",
      type: "",
      schedule: "",
      isMain: false
    }
  });
  
  // Watch for changes in auto detect setting
  const autoDetectEnabled = watchSettings('autoDetect');
  
  // Update form when stream settings are loaded
  useEffect(() => {
    if (streamSettings) {
      setSettingsValue('featuredChannel', streamSettings.featuredChannel);
      setSettingsValue('autoDetect', streamSettings.autoDetect);
      setSettingsValue('offlineBehavior', streamSettings.offlineBehavior);
    }
  }, [streamSettings, setSettingsValue]);
  
  // Save stream settings
  const onSaveSettings = async (data: StreamSettingsFormValues) => {
    try {
      await updateStreamSettings(data);
      toast({
        title: "Settings Updated",
        description: "Stream settings have been updated successfully.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stream settings.",
        variant: "destructive"
      });
    }
  };
  
  // Edit a channel
  const handleEditChannel = (id: number) => {
    const channel = streamChannels?.find(c => c.id === id);
    if (channel) {
      setChannelValue('name', channel.name);
      setChannelValue('url', channel.url);
      setChannelValue('displayName', channel.displayName);
      setChannelValue('type', channel.type);
      setChannelValue('schedule', channel.schedule || "");
      setChannelValue('isMain', channel.isMain);
      setEditingChannelId(id);
      setIsAddingChannel(true);
    }
  };
  
  // Delete a channel
  const handleDeleteChannel = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this channel?")) {
      try {
        await deleteStreamChannel(id);
        toast({
          title: "Channel Deleted",
          description: "Stream channel has been deleted successfully.",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete stream channel.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Copy channel URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: "URL copied to clipboard.",
        variant: "default"
      });
    });
  };
  
  // Save or update channel
  const onSaveChannel = async (data: StreamChannelFormValues) => {
    try {
      if (editingChannelId !== null) {
        await updateStreamChannel(editingChannelId, data);
        toast({
          title: "Channel Updated",
          description: "Stream channel has been updated successfully.",
          variant: "default"
        });
      } else {
        await createStreamChannel(data);
        toast({
          title: "Channel Created",
          description: "New stream channel has been created successfully.",
          variant: "default"
        });
      }
      
      // Reset form and state
      resetChannelForm();
      setEditingChannelId(null);
      setIsAddingChannel(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save stream channel.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Stream Settings</h1>
      
      <div className="glass p-6 rounded-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">Featured Stream</h3>
        <form onSubmit={handleSubmitSettings(onSaveSettings)} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Select Channel</label>
            <div className="relative inline-block w-full">
              <select 
                {...registerSettings('featuredChannel')}
                disabled={autoDetectEnabled}
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all appearance-none disabled:opacity-50"
              >
                {streamChannels?.map(channel => (
                  <option key={channel.id} value={channel.name}>
                    {channel.displayName}
                  </option>
                ))}
                <option value="auto">Auto-detect (currently live)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {settingsErrors.featuredChannel && (
              <p className="mt-1 text-sm text-red-500">{settingsErrors.featuredChannel.message}</p>
            )}
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Auto-detect Stream</label>
            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  {...registerSettings('autoDetect')}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-[#D4AF37] peer-focus:outline-none peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                <span className="ml-3 text-sm text-gray-300">Automatically feature currently live stream</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Offline Behavior</label>
            <div className="relative inline-block w-full">
              <select 
                {...registerSettings('offlineBehavior')}
                className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all appearance-none"
              >
                <option value="message">Show offline message</option>
                <option value="vod">Show latest VOD</option>
                <option value="image">Show custom image</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {settingsErrors.offlineBehavior && (
              <p className="mt-1 text-sm text-red-500">{settingsErrors.offlineBehavior.message}</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="px-4 py-2 bg-[#D4AF37] text-primary font-medium rounded hover:bg-[#FFD700] transition-colors"
            >
              Save Stream Settings
            </button>
          </div>
        </form>
      </div>
      
      <div className="glass p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Channel Management</h3>
          {!isAddingChannel && (
            <button 
              onClick={() => {
                setIsAddingChannel(true);
                setEditingChannelId(null);
                resetChannelForm();
              }}
              className="px-4 py-2 bg-[#D4AF37] text-primary font-medium rounded hover:bg-[#FFD700] transition-colors"
            >
              <FaPlus className="inline mr-2" /> Add Channel
            </button>
          )}
        </div>
        
        {isAddingChannel && (
          <div className="bg-gray-800 rounded p-4 mb-6">
            <h4 className="text-lg font-medium mb-3">
              {editingChannelId !== null ? "Edit Channel" : "Add New Channel"}
            </h4>
            <form onSubmit={handleSubmitChannel(onSaveChannel)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Channel Name</label>
                  <input 
                    type="text" 
                    {...registerChannel('name')}
                    placeholder="e.g. rennsz"
                    className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none transition-all"
                  />
                  {channelErrors.name && (
                    <p className="mt-1 text-xs text-red-500">{channelErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Channel URL</label>
                  <input 
                    type="text" 
                    {...registerChannel('url')}
                    placeholder="https://www.twitch.tv/rennsz"
                    className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none transition-all"
                  />
                  {channelErrors.url && (
                    <p className="mt-1 text-xs text-red-500">{channelErrors.url.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Display Name</label>
                  <input 
                    type="text" 
                    {...registerChannel('displayName')}
                    placeholder="RENNSZ - IRL Adventures"
                    className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none transition-all"
                  />
                  {channelErrors.displayName && (
                    <p className="mt-1 text-xs text-red-500">{channelErrors.displayName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Channel Type</label>
                  <input 
                    type="text" 
                    {...registerChannel('type')}
                    placeholder="IRL, Gaming, etc."
                    className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none transition-all"
                  />
                  {channelErrors.type && (
                    <p className="mt-1 text-xs text-red-500">{channelErrors.type.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium">Stream Schedule (optional)</label>
                <input 
                  type="text" 
                  {...registerChannel('schedule')}
                  placeholder="e.g. Streams every Tue, Thu, Sat"
                  className="w-full p-2 bg-gray-900 rounded border border-gray-700 focus:border-[#D4AF37] focus:outline-none transition-all"
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="isMainChannel" 
                  {...registerChannel('isMain')}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="isMainChannel" className="text-sm">Set as Main Channel</label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAddingChannel(false);
                    resetChannelForm();
                  }}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#D4AF37] text-primary font-medium rounded hover:bg-[#FFD700] transition-colors"
                >
                  {editingChannelId !== null ? "Update" : "Add"} Channel
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="space-y-6">
          {streamChannels?.map(channel => (
            <div key={channel.id} className="p-4 bg-gray-800 rounded">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-700 flex items-center justify-center">
                    {channel.type === "IRL" ? (
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#D4AF37]">
                        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-purple-500">
                        <path d="M6 12H18M6 8H18M6 16H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{channel.displayName}</h4>
                    <p className="text-gray-400 text-sm">{channel.isMain ? "Main Channel" : "Secondary Channel"}</p>
                  </div>
                </div>
                <a 
                  href={channel.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#9146FF] hover:underline flex items-center"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                  </svg>
                  View on Twitch
                </a>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Channel URL</p>
                  <div className="flex mt-1">
                    <input 
                      type="text" 
                      value={channel.url} 
                      readOnly 
                      className="flex-grow p-2 bg-gray-900 rounded-l border border-gray-700 focus:outline-none"
                    />
                    <button 
                      onClick={() => copyToClipboard(channel.url)}
                      className="bg-gray-700 px-3 rounded-r border border-gray-700 border-l-0 hover:bg-gray-600"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Channel Type</p>
                  <p className="p-2 mt-1 bg-gray-900 rounded border border-gray-700">
                    {channel.type}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3">
                <button 
                  onClick={() => handleEditChannel(channel.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button 
                  onClick={() => handleDeleteChannel(channel.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
          
          {(!streamChannels || streamChannels.length === 0) && (
            <div className="p-8 text-center text-gray-400">
              <p>No channels found. Add a channel to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
