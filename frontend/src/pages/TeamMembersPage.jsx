import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  ShieldCheck, 
  MoreHorizontal,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Modal from '../components/common/Modal.jsx';
import Select from '../components/common/Select.jsx';
import Dropdown, { DropdownItem } from '../components/common/Dropdown.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const TeamMembersPage = () => {
  const { members, inviteMember, workspace } = useApp();
  const [search, setSearch] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('team_member');

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    inviteMember(inviteEmail.trim(), inviteRole);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'workspace_owner': return 'terracotta';
      case 'admin': return 'sage';
      case 'project_manager': return 'mustard';
      default: return 'charcoal';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
            Team Members
          </h1>
          <p className="text-xs text-warm-500">
            Manage your workspace roster, roles, and collaborative permissions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={UserPlus}
          onClick={() => setIsInviteModalOpen(true)}
        >
          Invite Teammate
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            leftIcon={Search}
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="text-xs text-warm-500 font-medium">
          Showing <strong className="text-warm-800">{filteredMembers.length}</strong> of {members.length} members
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-warm-100/60 border-b border-warm-200 text-warm-700 font-heading font-bold uppercase tracking-wider text-[10px]">
              <th className="p-4">Member</th>
              <th className="p-4">Role & Permissions</th>
              <th className="p-4">Department</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-100 text-warm-700">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-warm-50/70 transition-colors">
                {/* Member Info */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="md"
                      status={member.status === 'active' ? 'online' : 'offline'}
                    />
                    <div>
                      <p className="font-heading font-bold text-sm text-warm-900 leading-snug">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-warm-400 font-mono">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="p-4">
                  <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
                    {member.roleTitle}
                  </Badge>
                </td>

                {/* Department */}
                <td className="p-4 text-warm-600 font-medium">
                  {member.department}
                </td>

                {/* Status */}
                <td className="p-4">
                  <Badge variant={member.status === 'active' ? 'sage' : 'mustard'} size="sm" dot>
                    {member.status === 'active' ? 'Active' : 'Invited'}
                  </Badge>
                </td>

                {/* Action Menu */}
                <td className="p-4 text-right">
                  <Dropdown
                    align="right"
                    trigger={() => (
                      <button
                        type="button"
                        className="p-1.5 text-warm-400 hover:text-warm-800 rounded-lg hover:bg-warm-100 transition-colors focus:outline-none"
                        aria-label="Member options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    )}
                  >
                    <DropdownItem onClick={() => {}}>View Profile</DropdownItem>
                    <DropdownItem onClick={() => {}}>Change Workspace Role</DropdownItem>
                    {member.role !== 'workspace_owner' && (
                      <DropdownItem danger onClick={() => {}}>
                        Remove Member
                      </DropdownItem>
                    )}
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="p-10 text-center">
            <EmptyState
              icon={Users}
              title="No teammates match this query"
              description={`No member found matching "${search}".`}
            />
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Teammate"
        description={`Send an invitation token link to join ${workspace.name}.`}
        maxWidth="md"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Work Email Address"
            type="email"
            leftIcon={Mail}
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Role & Access Level"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { value: 'team_member', label: 'Team Member (Tasks, Checklists, Discussions)' },
              { value: 'project_manager', label: 'Project Manager (Boards, Columns, Task Assignments)' },
              { value: 'admin', label: 'Administrator (Team Provisioning & Project Oversight)' },
            ]}
          />

          <div className="p-3 bg-warm-50 rounded-xl border border-warm-200 text-xs text-warm-500 space-y-1">
            <p className="font-bold text-warm-800">Security note:</p>
            <p>Invited members will receive a secure token valid for 48 hours to complete their account setup.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-warm-200">
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!inviteEmail.trim()}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamMembersPage;
