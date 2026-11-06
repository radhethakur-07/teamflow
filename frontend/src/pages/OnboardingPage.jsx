import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  FolderKanban, 
  ArrowRight, 
  Check, 
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Select from '../components/common/Select.jsx';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState('Acme Product Studio');
  const [teamSize, setTeamSize] = useState('5-15');
  const [domain, setDomain] = useState('Product Design & Engineering');
  const [inviteEmails, setInviteEmails] = useState(['alex@teamflow.app', 'maya@teamflow.app']);
  const [newEmail, setNewEmail] = useState('');

  const handleAddInvite = () => {
    if (newEmail.trim() && !inviteEmails.includes(newEmail.trim())) {
      setInviteEmails([...inviteEmails, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const handleRemoveInvite = (emailToRemove) => {
    setInviteEmails(inviteEmails.filter((e) => e !== emailToRemove));
  };

  const handleFinish = () => {
    toast.success(`Workspace "${workspaceName}" configured! Welcome aboard.`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                s === step
                  ? 'bg-terracotta-500 text-white shadow-warm-sm ring-4 ring-terracotta-100'
                  : s < step
                  ? 'bg-sage-500 text-white'
                  : 'bg-warm-200 text-warm-500'
              }`}
            >
              {s < step ? <Check className="w-4 h-4 stroke-[3]" /> : s}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
          {step === 1 && 'Name your workspace'}
          {step === 2 && 'Tell us about your team'}
          {step === 3 && 'Invite your colleagues'}
        </h2>
        <p className="text-xs text-warm-500">
          Step {step} of 3 &bull; You can customize these settings anytime later.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-warm-200 shadow-warm-md space-y-6">
          {/* STEP 1: Workspace Name */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Workspace Name"
                placeholder="e.g. Acme Product Studio"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                autoFocus
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
                    readOnly
                    value={workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                    className="flex-1 px-3 py-2 bg-transparent text-warm-800 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full mt-4"
                rightIcon={ArrowRight}
                onClick={() => setStep(2)}
                disabled={!workspaceName.trim()}
              >
                Continue to Team Profile
              </Button>
            </div>
          )}

          {/* STEP 2: Team Details */}
          {step === 2 && (
            <div className="space-y-4">
              <Select
                label="Team Focus / Primary Function"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                options={[
                  { value: 'Product Design & Engineering', label: 'Product Design & Engineering' },
                  { value: 'Creative Agency & Studio', label: 'Creative Agency & Studio' },
                  { value: 'Marketing & Brand Strategy', label: 'Marketing & Brand Strategy' },
                  { value: 'Startup & Venture Team', label: 'Startup & Venture Team' },
                ]}
              />

              <Select
                label="Team Size"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                options={[
                  { value: '1-5', label: '1 - 5 teammates' },
                  { value: '5-15', label: '5 - 15 teammates' },
                  { value: '15-50', label: '15 - 50 teammates' },
                  { value: '50+', label: '50+ teammates' },
                ]}
              />

              <div className="flex items-center gap-3 pt-2">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep(3)}
                  className="flex-1"
                  rightIcon={ArrowRight}
                >
                  Continue to Invites
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Invites */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-warm-700">
                  Invite Teammates by Email
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="colleague@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInvite())}
                  />
                  <Button variant="secondary" onClick={handleAddInvite} leftIcon={Plus}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Pending Invites List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-warm-400">
                  Pending Invites ({inviteEmails.length})
                </span>
                <div className="divide-y divide-warm-100 border border-warm-200 rounded-xl overflow-hidden bg-warm-50/50">
                  {inviteEmails.map((email) => (
                    <div
                      key={email}
                      className="p-2.5 flex items-center justify-between text-xs text-warm-800"
                    >
                      <span className="font-mono">{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInvite(email)}
                        className="text-warm-400 hover:text-terracotta-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-warm-100">
                <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleFinish}
                  className="flex-1"
                  rightIcon={Sparkles}
                >
                  Launch Workspace
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
