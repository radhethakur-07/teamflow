import React, { useState } from 'react';
import { User, Mail, Lock, Upload, Save, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export const ProfileSettingsPage = () => {
  const { currentUser } = useApp();
  const toast = useToast();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [jobTitle, setJobTitle] = useState('Lead Product Designer');
  const [bio, setBio] = useState('Passionate about tactile SaaS design systems, human typography, and seamless real-time interactions.');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success('Profile settings updated successfully!');
    }, 600);
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
            Profile Photo
          </h3>

          <div className="flex items-center gap-5">
            <Avatar
              src={currentUser.avatar}
              name={name}
              size="xl"
            />
            <div className="space-y-1.5">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={Upload}
                onClick={() => toast.info('Photo upload dialog simulated.')}
              >
                Change Avatar
              </Button>
              <p className="text-[11px] text-warm-400">
                Recommended: JPG, PNG, or WebP. Minimum 400x400px.
              </p>
            </div>
          </div>
        </Card>

        {/* Personal Details */}
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Input
            label="Job Title / Role"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />

          <Textarea
            label="Bio / About Me"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Card>

        {/* Password Update */}
        <Card padding="md" className="space-y-4">
          <h3 className="font-heading font-bold text-sm text-warm-900">
            Change Password
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={Save}
            isLoading={isLoading}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettingsPage;
