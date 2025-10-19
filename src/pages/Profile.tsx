import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Lock, 
  Calendar,
  Shield,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const Profile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setUserProfile(userData);
      } else {
        setError('No user data found');
      }
    } catch (err) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      toast({
        title: "Success",
        description: "Password changed successfully.",
      });

      setIsChangePasswordOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to change password.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p className="font-medium">Failed to load profile</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userProfile.name || 'Not provided'}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{userProfile.role.toLowerCase()}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">••••••••</span>
                </div>
              </div>
              
              <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new password.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleChangePassword}>
                      Change Password
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Account Statistics */}
        <Card className="shadow-card mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Account Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {userProfile.role === 'ADMIN' ? 'Admin' : 'User'}
                </div>
                <div className="text-sm text-muted-foreground">Account Type</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.floor((new Date().getTime() - new Date(userProfile.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-muted-foreground">Days Active</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {new Date().toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Joined Date</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
