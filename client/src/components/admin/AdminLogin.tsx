import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaTimes } from "react-icons/fa";
import { useAdmin } from "@/hooks/useAdmin";

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLogin({ isOpen, onClose, onSuccess }: AdminLoginProps) {
  const { login } = useAdmin();
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(false);
    
    try {
      const success = await login(data.username, data.password);
      if (success) {
        onSuccess();
      } else {
        setLoginError(true);
      }
    } catch (error) {
      setLoginError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="glass max-w-md w-full p-8 rounded-lg gold-border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold gold-gradient">Admin Login</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="adminUsername" className="block mb-2 font-medium">Username</label>
            <input 
              type="text" 
              id="adminUsername" 
              {...register("username")}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="adminPassword" className="block mb-2 font-medium">Password</label>
            <input 
              type="password" 
              id="adminPassword" 
              {...register("password")}
              className="w-full p-3 bg-gray-800 rounded border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          {loginError && (
            <div className="text-red-500">
              Invalid username or password. Please try again.
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-primary font-semibold rounded hover:shadow-lg hover:shadow-[#D4AF37]/20 transition-all disabled:opacity-70"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
