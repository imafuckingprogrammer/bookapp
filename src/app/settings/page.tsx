
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, UserCog, ShieldCheck, Palette, BellDot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
// import { updateUserProfile } from '@/lib/services/userService'; // Uncomment when backend connected
// import { sendPasswordResetEmail, updateUserPassword } from '@/lib/services/authService'; // Uncomment

export default function SettingsPage() {
  const { userProfile, authUser, isLoading: authLoading, fetchUserProfile, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  // const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.replace('/login');
    }
    if (userProfile) {
      setUsername(userProfile.username);
      setName(userProfile.name || '');
      setBio(userProfile.bio || '');
      setAvatarUrl(userProfile.avatar_url || '');
    }
  }, [authLoading, authUser, userProfile, router]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setIsSavingProfile(true);
    try {
      // const updatedProfile = await updateUserProfile({
      //   id: userProfile.id, // Ensure ID is passed if needed by backend for non-authed user update
      //   username,
      //   name,
      //   bio,
      //   avatar_url: avatarUrl,
      // });
      // await fetchUserProfile(userProfile.id); // Re-fetch to update context
      console.log("Profile update stub:", { username, name, bio, avatarUrl });
      toast({ title: "Profile Updated (Stubbed)", description: "Your profile changes have been 'saved'." });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ title: "Error", description: "Could not update profile.", variant: "destructive" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // const handleChangePassword = async (e: React.FormEvent) => { /* ... */ };
  // const handleRequestPasswordReset = async () => { /* ... */ };

  if (authLoading || !userProfile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><UserCog className="mr-2 h-5 w-5" /> Profile Settings</CardTitle>
          <CardDescription>Manage your public profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your unique username" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name (optional)" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.png" />
               {avatarUrl && <img src={avatarUrl} alt="Avatar preview" className="mt-2 h-20 w-20 rounded-full object-cover"/>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a bit about yourself..." className="min-h-[100px]" />
            </div>
            <Button type="submit" disabled={isSavingProfile}>
              {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile Changes
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {/* Placeholder for Account Settings (Email, Password) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5" /> Account Settings</CardTitle>
          <CardDescription>Manage your login email and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={authUser?.email || 'loading...'} disabled />
          </div>
          <p className="text-sm text-muted-foreground">Password change functionality is not yet implemented in this stub.</p>
          {/* 
          <Button onClick={handleRequestPasswordReset} variant="outline" disabled>Request Password Reset Email (Stub)</Button>
          <Separator />
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password (Stub)
            </Button>
          </form>
          */}
        </CardContent>
      </Card>

      {/* Placeholder for Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><BellDot className="mr-2 h-5 w-5" /> Notification Settings</CardTitle>
          <CardDescription>Control what you get notified about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="email-new-follower" className="flex-1">Email for new followers</Label>
                <Switch id="email-new-follower" disabled />
            </div>
             <div className="flex items-center justify-between p-3 border rounded-md">
                <Label htmlFor="email-review-likes" className="flex-1">Email for likes on your reviews</Label>
                <Switch id="email-review-likes" defaultChecked disabled />
            </div>
          <p className="text-sm text-muted-foreground">Notification settings are not yet functional.</p>
        </CardContent>
      </Card>

      {/* Placeholder for Appearance Settings */}
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5" /> Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">Dark mode / Light mode toggle (typically handled by system or a theme switcher in Header/Layout) - Not implemented here.</p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button variant="destructive" onClick={logout}>Log Out</Button>
      </div>

    </div>
  );
}
