import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';

export const WorkspaceSettingsPage = () => {
  const { workspace, updateWorkspace, members } = useApp();
  const toast = useToast();

  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [slug, setSlug] = useState(workspace?.slug || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setDescription(workspace.description || '');
      setSlug(workspace.slug || '');
    }
  }, [workspace]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await updateWorkspace({
        name: name.trim(),
        description: description.trim(),
      });
    } catch (err) {
      // Handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs text-warm-500">
          Governance, branding, and team configuration for <strong className="text-warm-800">{workspace?.name}</strong>.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Settings */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-warm-100 pb-3">
            <h3 className="font-heading font-bold text-sm text-warm-900">
              General Information
            </h3>
            <Badge variant="terracotta" size="sm">Workspace Owner</Badge>
          </div>

          <div className="space-y-4">
            <Input
              label="Workspace Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Studio"
              required
            />

            <Input
              label="Slug Identifier"
              value={slug}
              disabled
              helperText="Workspace slugs are used in URLs and cannot be modified."
            />

            <Textarea
              label="Workspace Purpose / Bio"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your organization or team mission..."
              rows={3}
            />
          </div>

          <div className="pt-3 border-t border-warm-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={Save}
              isLoading={isLoading}
            >
              Save Workspace Changes
            </Button>
          </div>
        </Card>

        {/* Subscription & Tier */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-warm-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-warm-500" />
              <h3 className="font-heading font-bold text-sm text-warm-900">
                Subscription & Plan
              </h3>
            </div>
            <Badge variant="sage" size="sm">Active</Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-warm-100/70 border border-warm-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-warm-900 capitalize">
                  {workspace?.plan || 'Starter'} Plan
                </span>
                <span className="text-[11px] text-warm-500">&bull; Unlimited Projects</span>
              </div>
              <p className="text-xs text-warm-500">
                Current usage: <strong>{members.length}</strong> active members
              </p>
            </div>

            <Button variant="secondary" size="sm">
              Manage Billing
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default WorkspaceSettingsPage;
