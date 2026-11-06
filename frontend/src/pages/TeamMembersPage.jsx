import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  ShieldCheck, 
  MoreHorizontal,
  Trash2,
  FolderGit2,
  Plus,
  Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Badge from '../components/common/Badge.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Modal from '../components/common/Modal.jsx';
import Select from '../components/common/Select.jsx';
import Tabs, { TabPanel } from '../components/common/Tabs.jsx';
import Dropdown, { DropdownItem } from '../components/common/Dropdown.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const TeamMembersPage = () => {
  const { 
    members, 
    teams, 
    inviteMember, 
    updateMemberRole, 
    removeMember, 
    createTeam, 
    deleteTeam,
    workspace,
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState('members');
  const [search, setSearch] = useState('');

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('team_member');
  const [isInviting, setIsInviting] = useState(false);

  // Create Team Modal
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const filteredMembers = members.filter((m) => {
    const userObj = m.user || m;
    const name = (userObj.name || '').toLowerCase();
    const email = (userObj.email || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch (err) {
      // Handled in context
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsCreatingTeam(true);
    try {
      await createTeam({
        name: teamName.trim(),
        description: teamDescription.trim(),
      });
      setTeamName('');
      setTeamDescription('');
      setIsCreateTeamOpen(false);
    } catch (err) {
      // Handled in context
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'workspace_owner': return 'terracotta';
      case 'admin': return 'sage';
      case 'project_manager': return 'mustard';
      default: return 'charcoal';
    }
  };

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'workspace_owner': return 'Workspace Owner';
      case 'admin': return 'Administrator';
      case 'project_manager': return 'Project Manager';
      default: return 'Team Member';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
            Team & Membership
          </h1>
          <p className="text-xs text-warm-500">
            Manage your workspace roster, roles, and collaborative team squads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'members' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={UserPlus}
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Member
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={() => setIsCreateTeamOpen(true)}
            >
              Create Team
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'members', label: `Members (${members.length})` },
          { id: 'teams', label: `Teams (${teams.length})` },
        ]}
      />

      {/* TAB 1: MEMBERS */}
      <TabPanel id="members" activeTab={activeTab}>
        <div className="space-y-4">
          {/* Search bar */}
          <div className="max-w-md">
            <Input
              leftIcon={Search}
              placeholder="Filter members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-warm-700">
                <thead className="bg-warm-50/80 border-b border-warm-200 uppercase font-heading font-bold text-[10px] tracking-wider text-warm-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Member</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {filteredMembers.map((member) => {
                    const userObj = member.user || member;
                    const memberId = member._id || member.id;
                    const isOwner = member.role === 'workspace_owner';

                    return (
                      <tr key={memberId} className="hover:bg-warm-50/50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={userObj.avatarUrl || userObj.avatar}
                              name={userObj.name || userObj.email}
                              size="md"
                            />
                            <div>
                              <div className="font-heading font-bold text-warm-900 flex items-center gap-1.5">
                                <span>{userObj.name}</span>
                                {isOwner && (
                                  <Crown className="w-3.5 h-3.5 text-terracotta-500 inline" title="Workspace Owner" />
                                )}
                              </div>
                              <p className="text-[11px] text-warm-500">{userObj.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
                            {formatRoleLabel(member.role)}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-600 capitalize">
                            <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                            {member.status || 'active'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {!isOwner && (
                            <Dropdown
                              align="right"
                              trigger={
                                <button
                                  type="button"
                                  className="p-1 rounded-md text-warm-400 hover:text-warm-700 hover:bg-warm-100"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              }
                            >
                              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-warm-400">
                                Change Role
                              </div>
                              <DropdownItem onClick={() => updateMemberRole(memberId, 'admin')}>
                                Administrator
                              </DropdownItem>
                              <DropdownItem onClick={() => updateMemberRole(memberId, 'project_manager')}>
                                Project Manager
                              </DropdownItem>
                              <DropdownItem onClick={() => updateMemberRole(memberId, 'team_member')}>
                                Team Member
                              </DropdownItem>
                              <div className="border-t border-warm-100 my-1" />
                              <DropdownItem
                                onClick={() => removeMember(memberId)}
                                className="text-terracotta-600 font-bold"
                              >
                                Remove from Workspace
                              </DropdownItem>
                            </Dropdown>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-warm-400">
                        No team members matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </TabPanel>

      {/* TAB 2: TEAMS */}
      <TabPanel id="teams" activeTab={activeTab}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const teamId = team._id || team.id;
              const memberCount = (team.memberIds || []).length;

              return (
                <div
                  key={teamId}
                  className="bg-white rounded-2xl border border-warm-200 p-5 shadow-warm-sm hover:shadow-warm-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-terracotta-500" />
                        <h3 className="font-heading font-bold text-sm text-warm-900">
                          {team.name}
                        </h3>
                      </div>
                      <p className="text-xs text-warm-500 line-clamp-2">
                        {team.description || 'No description provided.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteTeam(teamId)}
                      className="text-warm-400 hover:text-terracotta-600 p-1 rounded-md"
                      title="Delete team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-warm-100 flex items-center justify-between text-xs text-warm-500">
                    <span>{memberCount} Assigned Members</span>
                    {team.leadId && (
                      <span className="font-semibold text-warm-700">
                        Lead: {team.leadId.name || 'Lead'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {teams.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon={FolderGit2}
                  title="No functional teams created yet"
                  description="Group your collaborators into focused functional teams (e.g. Design, Frontend, DevOps) to streamline project assignments."
                  actionLabel="Create Team"
                  onAction={() => setIsCreateTeamOpen(true)}
                />
              </div>
            )}
          </div>
        </div>
      </TabPanel>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Colleague"
        description="Send an invitation link to collaborate on this workspace."
        maxWidth="sm"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <Input
            label="Colleague's Work Email"
            type="email"
            leftIcon={Mail}
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Initial Workspace Role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            options={[
              { value: 'team_member', label: 'Team Member (Default)' },
              { value: 'project_manager', label: 'Project Manager' },
              { value: 'admin', label: 'Administrator' },
            ]}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isInviting}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        title="Create Team Squad"
        description="Organize workspace members into functional teams."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
          <Input
            label="Team Name"
            placeholder="e.g. Frontend Engineering"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. UI architecture, React components, and design system"
            value={teamDescription}
            onChange={(e) => setTeamDescription(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateTeamOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreatingTeam}
            >
              Create Team
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamMembersPage;
