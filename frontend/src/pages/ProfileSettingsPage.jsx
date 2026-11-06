import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Upload, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import authService from '../services/authService.js';
import Avatar from '../components/common/Avatar.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export const ProfileSettingsPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setJobTitle(user.jobTitle || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.updateMe({
        name: name.trim(),
        jobTitle: jobTitle.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      toast.success('Profile settings updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }

    setIsChangingPass(true);
    try {
      await authService.updatePassword({ currentPassword, newPassword });
      toast.success('Account password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs text-warm-500">
          Manage your personal account details, biography, and security credentials.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Avatar Section */}
        <Card padding="md" className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-warm-900">
            Profile Photo & Identity
          </h3>

          <div className="flex items-center gap-5">
            <Avatar
              src={avatarUrl}
              name={name || 'User'}
              size="xl"
            />
            <div className="space-y-1.5 flex-1 max-w-md">
              <Input
                label="Avatar Image URL (Optional)"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <p className="text-[11px] text-warm-400">
                Recommended: Direct image URL (JPG, PNG, or WebP).
              </p>
            </div>
          </div>
        </Card>

        {/* General Details */}
        <Card padding="md" className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-warm-900">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Work Email"
              type="email"
              value={email}
              disabled
              helperText="Contact workspace administrator to change login email."
            />
          </div>

          <Input
            label="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Architect"
          />

          <Textarea
            label="Professional Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share what initiatives you are leading..."
            rows={3}
          />

          <div className="pt-3 border-t border-warm-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={Save}
              isLoading={isLoading}
            >
              Save Profile
            </Button>
          </div>
        </Card>
      </form>

      {/* Security Credentials Section */}
      <form onSubmit={handleUpdatePassword}>
        <Card padding="md" className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-warm-900">
            Security & Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="pt-3 border-t border-warm-100 flex justify-end">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              leftIcon={Lock}
              isLoading={isChangingPass}
              disabled={!currentPassword || !newPassword}
            >
              Update Password
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
