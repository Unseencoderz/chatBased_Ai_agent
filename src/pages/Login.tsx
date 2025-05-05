
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signUp, getSession } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import ProfileSetup from "@/components/ProfileSetup";
import { User } from "@/types";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(searchParams.get("signup") ? "signup" : "login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [newUser, setNewUser] = useState<User | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: "Logged in successfully",
        description: "Welcome back to DevStream!",
      });
      
      // Force reload to ensure all auth state is updated
      window.location.href = '/';
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!username.trim()) {
        throw new Error("Username is required");
      }
      
      const { data, error } = await signUp(email, password, username);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Check if we're in email confirmation mode
      if (data?.user && data.user.identities?.length === 0) {
        toast({
          title: "Verification email sent",
          description: "Please check your email to confirm your account before logging in.",
        });
        setActiveTab("login");
        setLoading(false);
        return;
      }
      
      if (data && data.user) {
        // Get the user data after signup
        // We'll wait a brief moment to ensure the trigger has run
        setTimeout(async () => {
          try {
            // Attempt to sign in to get the session
            await signIn(email, password);
            
            // Now show profile setup
            setNewUser({
              id: data.user.id,
              email: email,
              username: username,
              name: username,
              bio: '',
              created_at: new Date().toISOString(),
            } as User);
            
            setShowProfileSetup(true);
            
            toast({
              title: "Account created successfully",
              description: "Welcome to DevStream! Let's set up your profile.",
            });
          } catch (error: any) {
            console.error("Error during post-signup flow:", error);
            // Fall back to redirect
            window.location.href = '/';
          } finally {
            setLoading(false);
          }
        }, 500); // Give a small delay to ensure trigger runs
      } else {
        // If no user data, go to login
        setActiveTab("login");
        setLoading(false);
        
        toast({
          title: "Sign up successful",
          description: "Please log in with your new credentials.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleProfileSetupComplete = () => {
    // Navigate to home page after profile setup
    window.location.href = '/';
  };

  if (showProfileSetup && newUser) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container py-8 flex items-center justify-center">
          <div className="w-full max-w-lg">
            <ProfileSetup 
              user={newUser} 
              onComplete={handleProfileSetupComplete} 
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container py-8 flex items-center justify-center">
        <Card className="w-full max-w-md border-white/10 bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to DevStream</CardTitle>
            <CardDescription>
              Share your projects with the developer community
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="devuser123"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex-col space-y-2">
            <div className="text-xs text-muted-foreground text-center">
              By continuing, you agree to DevStream's Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Login;
