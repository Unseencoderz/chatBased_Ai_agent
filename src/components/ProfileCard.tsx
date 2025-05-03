
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { Edit } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileCardProps {
  user: User;
  projectCount: number;
  avgRating?: number;
  isCurrentUser?: boolean;
  className?: string;
}

const ProfileCard = ({
  user,
  projectCount,
  avgRating,
  isCurrentUser = false,
  className,
}: ProfileCardProps) => {
  return (
    <Card className={`border-white/10 bg-black/20 backdrop-blur-sm ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
        
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            {user.name?.substring(0, 2).toUpperCase() || user.username?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {user.bio && (
          <p className="text-sm text-muted-foreground">{user.bio}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Projects</p>
            <p className="text-2xl font-bold">{projectCount}</p>
          </div>
          
          {avgRating !== undefined && (
            <div>
              <p className="text-sm font-medium">Avg. Rating</p>
              <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
            </div>
          )}
        </div>
        
        {isCurrentUser && (
          <Button variant="outline" className="w-full" asChild>
            <Link to="/profile/edit" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
