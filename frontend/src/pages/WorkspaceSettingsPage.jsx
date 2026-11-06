import React, { useState } from 'react';
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
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';

export const WorkspaceSettingsPage = () => {
  const { workspace, members } = useApp();
  const toast = useToast();
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast.success('Workspace settings updated successfully.');
    }, 600);
  };

  const handleDeleteWorkspace = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      toast.error('Workspace deletion request initiated (Simulated in UI preview).');
    }, 800);
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs text-warm-500">
          Governance, plan management, and organization configuration for <strong className="text-warm-800">{workspace.name}</strong>.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* General Settings */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-warm-100 pb-3">
            <h3 className="font-heading font-bold text-sm text-warm-900">
              General Information
            </h3>
            <Badge variant="terracotta" size="sm">Owner Access</Badge>
          </div>

          <div className="space-y-4">
            <Input
              label="Workspace Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-warm-700">
                Workspace URL Identifier
              </label>
              <div className="flex rounded-lg border border-warm-300 bg-warm-50 overflow-hidden shadow-warm-sm text-xs">
                <span className="px-3 py-2 text-warm-400 font-mono bg-warm-100 border-r border-warm-200">
                  teamflow.app/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-3 py-2 bg-transparent text-warm-800 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Plan & Usage */}
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

          <div className="p-4 rounded-xl bg-warm-50 border border-warm-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-warm-900">
                {workspace.plan}
              </h4>
              <p className="text-xs text-warm-500">
                Unlimited boards, sub-100ms real-time sync, and up to 20 team seats.
              </p>
              <div className="pt-2 text-xs text-warm-600 font-semibold">
                {members.length} of 20 seats allocated
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.info('Billing portal simulated.')}
            >
              Manage Plan
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={Save}
            isLoading={isLoading}
          >
            Save Workspace Changes
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <Card padding="md" className="border-terracotta-200 bg-terracotta-50/20 space-y-4">
        <div className="flex items-center gap-2 text-terracotta-600 font-heading font-bold text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </div>

        <p className="text-xs text-warm-600">
          Deleting a workspace will permanently delete all projects, Kanban boards, tasks, comments, and member associations.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-terracotta-100">
          <div>
            <p className="text-xs font-bold text-warm-900">Permanently delete workspace</p>
            <p className="text-[11px] text-warm-400">Irreversible action</p>
          </div>

          <Button
            variant="danger"
            size="sm"
            leftIcon={Trash2}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Workspace
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteWorkspace}
        title={`Delete "${workspace.name}"?`}
        message="This action is irreversible. All projects, Kanban tasks, and team memberships will be permanently deleted."
        confirmText="Yes, Delete Workspace"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default WorkspaceSettingsPage;
