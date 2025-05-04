
import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getCurrentUser, getUserProfile, updateUserProfile } from "@/lib/supabase";
import { User } from "@/types";
import Navbar from "@/components/Navbar";
import { Image, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const ProfileEdit = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: ""
  });
  
  useEffect(() => {
    async function loadData() {
      if (!username) return;
      
      try {
        // Load current user
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        
        // Load profile to edit
        const { data: profileData, error: profileError } = await getUserProfile(username);
        
        if (profileError || !profileData) {
          toast({
            title: "Error loading profile",
            description: "Profile not found or you don't have access.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        setUser(profileData);
        
        // Set form data
        setFormData({
          name: profileData.name || "",
          username: profileData.username || "",
          bio: profileData.bio || ""
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading profile",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [username, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !currentUser) return;
    
    // Don't allow editing of other users' profiles
    if (user.id !== currentUser.id) {
      toast({
        title: "Access denied",
        description: "You can only edit your own profile.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaveLoading(true);
      
      const { error } = await updateUserProfile(user.id, formData);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Redirect to profile page
      navigate(`/profile/${formData.username}`);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !user) return;
    
    const file = e.target.files[0];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    
    // Validate file size
    if (file.size > maxSizeInBytes) {
      toast({
        title: "File too large",
        description: "Avatar image must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUploadingAvatar(true);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      if (!data.publicUrl) throw new Error("Failed to get public URL");
      
      // Update user profile with new avatar URL
      const { error: updateError } = await updateUserProfile(user.id, {
        avatar_url: data.publicUrl
      });
      
      if (updateError) throw updateError;
      
      // Update local state
      setUser(prev => prev ? { ...prev, avatar_url: data.publicUrl } : null);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  // Redirect if not authenticated or trying to edit someone else's profile
  if (!loading && (!currentUser || (currentUser && user && currentUser.id !== user.id))) {
    return <Navigate to="/" />;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-muted/20 rounded-lg"></div>
            <div className="h-8 w-1/3 bg-muted/20 rounded"></div>
            <div className="h-32 bg-muted/20 rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <Button onClick={() => navigate(`/profile/${username}`)} variant="outline">
              Cancel
            </Button>
          </div>
          
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar_url || undefined} alt={user?.name || user?.username || ""} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {user?.name ? user.name[0].toUpperCase() : user?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground p-1.5 rounded-full">
                    <Upload className="h-4 w-4" />
                  </div>
                </Label>
                <Input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="sr-only" 
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </div>
            </div>
            
            {uploadingAvatar && <p className="text-sm text-muted-foreground">Uploading...</p>}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 border border-white/10 p-6 rounded-lg bg-black/20">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={5}
                />
              </div>
            </div>
            
            <Button type="submit" disabled={saveLoading} className="w-full">
              {saveLoading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfileEdit;
