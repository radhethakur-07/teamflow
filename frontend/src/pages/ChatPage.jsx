import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Hash,
  Send,
  Users,
  Search,
  Check,
  CheckCheck,
  ChevronLeft,
  Circle,
  FolderKanban,
  Smile,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import messageService from '../services/messageService.js';
import Avatar from '../components/common/Avatar.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const ChatPage = () => {
  const { workspace, projects, members } = useApp();
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    isUserOnline,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    markMessagesRead,
    unreadCounts,
    refreshUnreadCounts,
    onMessageReceived,
    onTypingUpdate,
    onReadReceipt,
  } = useSocket();

  const workspaceId = workspace?._id || workspace?.id;
  const currentUserId = user?._id || user?.id;

  // Active channel / direct recipient state
  // mode: 'channel' | 'direct'
  const [activeChat, setActiveChat] = useState({
    mode: 'channel',
    id: 'general',
    name: 'general',
    description: 'Workspace-wide announcements and team discussions',
  });

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // userId -> { userName, timeoutId }
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Compute canonical room string
  const currentRoomName = activeChat.mode === 'direct'
    ? `direct:${[currentUserId, activeChat.id].sort().join('_')}`
    : activeChat.id === 'general'
    ? `workspace:${workspaceId}`
    : `project:${activeChat.id}`;

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // 1. Join room and load message history
  useEffect(() => {
    if (!workspaceId) return;

    let isMounted = true;
    setIsLoadingMessages(true);
    setMessages([]);
    setTypingUsers({});

    // Join room
    joinRoom(currentRoomName);

    // Fetch messages
    const fetchHistory = async () => {
      try {
        const query = activeChat.mode === 'direct'
          ? { recipientId: activeChat.id }
          : { channelId: activeChat.id };

        const history = await messageService.getMessages(workspaceId, query);
        if (isMounted) {
          setMessages(history || []);
          setIsLoadingMessages(false);
          setTimeout(() => scrollToBottom(false), 50);

          // Mark unread messages as read
          const unreadIds = (history || [])
            .filter((m) => {
              const senderId = m.senderId?._id || m.senderId;
              return senderId !== currentUserId && (!m.readBy || !m.readBy.some((r) => (r._id || r) === currentUserId));
            })
            .map((m) => m._id);

          if (unreadIds.length > 0) {
            markMessagesRead(currentRoomName, unreadIds);
            messageService.markRead(workspaceId, { messageIds: unreadIds }).catch(() => {});
            refreshUnreadCounts();
          }
        }
      } catch (err) {
        console.error('[Chat History Error]', err);
        if (isMounted) setIsLoadingMessages(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
      leaveRoom(currentRoomName);
    };
  }, [workspaceId, currentRoomName, activeChat, currentUserId, joinRoom, leaveRoom, markMessagesRead, refreshUnreadCounts]);

  // 2. Real-time message listener
  useEffect(() => {
    const unsubMsg = onMessageReceived((data) => {
      const { room, message } = data || {};
      if (!message) return;

      // Check if message belongs to current active conversation
      const isForActiveChat =
        (activeChat.mode === 'direct' &&
          (message.senderId?._id === activeChat.id || message.recipientId === activeChat.id)) ||
        (activeChat.mode === 'channel' && message.channelId === activeChat.id);

      if (isForActiveChat) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m._id === message._id || (message.clientTempId && m.clientTempId === message.clientTempId))) {
            return prev.map((m) => (m.clientTempId === message.clientTempId ? message : m));
          }
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom(true), 50);

        // Auto mark as read if from someone else
        const senderId = message.senderId?._id || message.senderId;
        if (senderId !== currentUserId) {
          markMessagesRead(currentRoomName, [message._id]);
          messageService.markRead(workspaceId, { messageIds: [message._id] }).catch(() => {});
        }
      }
    });

    // Typing updates
    const unsubTyping = onTypingUpdate(({ room, userId, userName, isTyping }) => {
      if (userId === currentUserId) return;
      if (room === currentRoomName) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          if (isTyping) {
            next[userId] = userName;
          } else {
            delete next[userId];
          }
          return next;
        });
      }
    });

    // Read receipt updates
    const unsubReceipt = onReadReceipt(({ room, readerId, messageIds }) => {
      if (room === currentRoomName && Array.isArray(messageIds)) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (messageIds.includes(msg._id.toString())) {
              const currentReadBy = Array.isArray(msg.readBy) ? msg.readBy : [];
              const exists = currentReadBy.some((r) => (r._id || r).toString() === readerId.toString());
              if (!exists) {
                return { ...msg, readBy: [...currentReadBy, readerId] };
              }
            }
            return msg;
          })
        );
      }
    });

    return () => {
      unsubMsg();
      unsubTyping();
      unsubReceipt();
    };
  }, [activeChat, currentUserId, currentRoomName, workspaceId, onMessageReceived, onTypingUpdate, onReadReceipt, markMessagesRead]);

  // 3. Typing debounce handler
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (!val.trim()) {
      sendTyping(currentRoomName, false);
      return;
    }

    sendTyping(currentRoomName, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(currentRoomName, false);
    }, 2000);
  };

  // 4. Send Message
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending || !workspaceId) return;

    const content = inputText.trim();
    setInputText('');
    sendTyping(currentRoomName, false);
    setIsSending(true);

    const clientTempId = `temp-${Date.now()}`;
    const payload = {
      workspaceId,
      content,
      clientTempId,
      ...(activeChat.mode === 'direct'
        ? { recipientId: activeChat.id }
        : { channelId: activeChat.id }),
    };

    // Optimistic message
    const optimisticMessage = {
      _id: clientTempId,
      clientTempId,
      content,
      senderId: {
        _id: currentUserId,
        name: user?.name || 'You',
        avatarUrl: user?.avatarUrl,
      },
      createdAt: new Date().toISOString(),
      readBy: [currentUserId],
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => scrollToBottom(true), 20);

    sendMessage(payload, (res) => {
      setIsSending(false);
      if (res?.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.clientTempId === clientTempId ? res.message : m))
        );
      }
    });
  };

  // Filtered members for direct messaging
  const otherMembers = members.filter((m) => {
    const mUserId = m.user?._id || m.user?.id || m._id;
    return mUserId !== currentUserId;
  });

  const filteredMembers = otherMembers.filter((m) => {
    const name = m.name || m.user?.name || '';
    const email = m.email || m.user?.email || '';
    return name.toLowerCase().includes(searchMemberQuery.toLowerCase()) || email.toLowerCase().includes(searchMemberQuery.toLowerCase());
  });

  // Typing banner message
  const typingNames = Object.values(typingUsers);
  const typingText =
    typingNames.length === 1
      ? `${typingNames[0]} is typing...`
      : typingNames.length > 1
      ? `${typingNames.join(', ')} are typing...`
      : null;

  return (
    <div className="flex h-[calc(100vh-5rem)] max-w-7xl mx-auto rounded-2xl border border-warm-200 bg-white shadow-warm-sm overflow-hidden text-left relative">
      {/* LEFT SIDEBAR: Channels & Direct Messages */}
      <div
        className={`w-80 border-r border-warm-200 bg-warm-50 flex flex-col shrink-0 transition-transform duration-200 absolute md:static inset-y-0 left-0 z-30 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-warm-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-heading font-bold text-warm-900 tracking-tight">
              Team Chat
            </h2>
            <p className="text-[11px] text-warm-500">
              {isConnected ? (
                <span className="flex items-center gap-1.5 text-sage-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  Live Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-warm-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-warm-300" />
                  Reconnecting...
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1 text-warm-500 hover:text-warm-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Member Search */}
        <div className="p-2.5 border-b border-warm-200">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-warm-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchMemberQuery}
              onChange={(e) => setSearchMemberQuery(e.target.value)}
              className="w-full bg-white border border-warm-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-1 focus:ring-terracotta-400"
            />
          </div>
        </div>

        {/* Channels & Member Lists */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {/* Workspace Channels */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-warm-400 px-2 select-none">
              Channels
            </span>
            <div className="mt-1 space-y-0.5">
              {/* # general */}
              <button
                type="button"
                onClick={() => {
                  setActiveChat({
                    mode: 'channel',
                    id: 'general',
                    name: 'general',
                    description: 'Workspace-wide discussions and general announcements',
                  });
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeChat.mode === 'channel' && activeChat.id === 'general'
                    ? 'bg-terracotta-50 text-terracotta-700 shadow-warm-xs'
                    : 'text-warm-700 hover:bg-warm-100/70 hover:text-warm-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Hash className="w-4 h-4 text-warm-400 shrink-0" />
                  <span className="truncate">general</span>
                </div>
                {unreadCounts?.channelCounts?.general > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-terracotta-500 text-white text-[10px] font-bold">
                    {unreadCounts.channelCounts.general}
                  </span>
                )}
              </button>

              {/* Project specific rooms */}
              {projects.map((p) => {
                const pId = (p._id || p.id).toString();
                const isActive = activeChat.mode === 'channel' && activeChat.id === pId;
                const unread = unreadCounts?.channelCounts?.[pId] || 0;

                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => {
                      setActiveChat({
                        mode: 'channel',
                        id: pId,
                        name: p.name,
                        description: p.description || `Project channel for ${p.name}`,
                      });
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-terracotta-50 text-terracotta-700 font-semibold shadow-warm-xs'
                        : 'text-warm-700 hover:bg-warm-100/70 hover:text-warm-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderKanban
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: p.color || '#E98269' }}
                      />
                      <span className="truncate">{p.name}</span>
                    </div>
                    {unread > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-terracotta-500 text-white text-[10px] font-bold">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages List */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-warm-400 px-2 select-none">
              Direct Messages ({filteredMembers.length})
            </span>
            <div className="mt-1 space-y-0.5">
              {filteredMembers.map((m) => {
                const mUserId = (m.user?._id || m.user?.id || m._id).toString();
                const mName = m.name || m.user?.name || 'Member';
                const mAvatar = m.avatar || m.user?.avatarUrl || m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mName)}`;
                const isOnline = isUserOnline(mUserId);
                const isActive = activeChat.mode === 'direct' && activeChat.id === mUserId;
                const unread = unreadCounts?.directCounts?.[mUserId] || 0;

                return (
                  <button
                    key={mUserId}
                    type="button"
                    onClick={() => {
                      setActiveChat({
                        mode: 'direct',
                        id: mUserId,
                        name: mName,
                        avatar: mAvatar,
                        description: isOnline ? 'Online now' : 'Offline',
                      });
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-white text-warm-900 font-semibold shadow-warm-xs border border-warm-200'
                        : 'text-warm-700 hover:bg-warm-100/70 hover:text-warm-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative shrink-0">
                        <img
                          src={mAvatar}
                          alt={mName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-warm-50 ${
                            isOnline ? 'bg-sage-500' : 'bg-warm-300'
                          }`}
                        />
                      </div>
                      <div className="truncate text-left">
                        <p className="truncate leading-tight font-medium">{mName}</p>
                        <p className="text-[10px] text-warm-400 capitalize truncate">
                          {isOnline ? 'active now' : 'offline'}
                        </p>
                      </div>
                    </div>
                    {unread > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-terracotta-500 text-white text-[10px] font-bold shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-warm-200 flex items-center justify-between bg-warm-50/50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-warm-600 hover:bg-warm-100"
            >
              <Users className="w-5 h-5" />
            </button>

            {activeChat.mode === 'direct' ? (
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={activeChat.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeChat.name)}`}
                    alt={activeChat.name}
                    className="w-8 h-8 rounded-full object-cover border border-warm-200"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      isUserOnline(activeChat.id) ? 'bg-sage-500' : 'bg-warm-300'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-bold text-warm-900 leading-tight">
                    {activeChat.name}
                  </h3>
                  <p className="text-[11px] text-warm-500 font-medium">
                    {isUserOnline(activeChat.id) ? (
                      <span className="text-sage-600">Active Now</span>
                    ) : (
                      'Offline'
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-warm-100 flex items-center justify-center text-warm-700">
                  <Hash className="w-4 h-4 text-terracotta-500" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-bold text-warm-900 leading-tight flex items-center gap-1.5">
                    #{activeChat.name}
                  </h3>
                  <p className="text-[11px] text-warm-500 truncate max-w-sm">
                    {activeChat.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {isLoadingMessages ? (
            <div className="space-y-4 py-8">
              <div className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-warm-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-24 h-3 bg-warm-200 rounded" />
                  <div className="w-48 h-8 bg-warm-100 rounded-xl" />
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end animate-pulse">
                <div className="space-y-1.5">
                  <div className="w-40 h-8 bg-warm-200 rounded-xl" />
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center py-16">
              <EmptyState
                icon={MessageSquare}
                title={`Welcome to #${activeChat.name}`}
                description="This is the start of this conversation. Send a message to get started!"
              />
            </div>
          ) : (
            messages.map((msg, index) => {
              const senderId = (msg.senderId?._id || msg.senderId)?.toString();
              const isMine = senderId === currentUserId?.toString();
              const senderName = isMine ? 'You' : msg.senderId?.name || 'Member';
              const senderAvatar = isMine
                ? user?.avatarUrl
                : msg.senderId?.avatar || msg.senderId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(senderName)}`;

              const isReadByOthers =
                isMine &&
                Array.isArray(msg.readBy) &&
                msg.readBy.some((r) => (r._id || r)?.toString() !== currentUserId?.toString());

              const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg._id || msg.clientTempId || index}
                  className={`flex items-end gap-2.5 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <img
                      src={senderAvatar}
                      alt={senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-warm-200"
                    />
                  )}

                  <div className={`max-w-md sm:max-w-lg space-y-1 ${isMine ? 'items-end' : 'items-start'}`}>
                    {!isMine && (
                      <span className="text-[11px] font-semibold text-warm-700 ml-1">
                        {senderName}
                      </span>
                    )}

                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-warm-xs ${
                        isMine
                          ? 'bg-warm-900 text-warm-50 rounded-br-xs'
                          : 'bg-warm-50 border border-warm-200 text-warm-900 rounded-bl-xs'
                      } ${msg.isOptimistic ? 'opacity-70' : ''}`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 text-[10px] text-warm-400 ${
                        isMine ? 'justify-end pr-1' : 'pl-1'
                      }`}
                    >
                      <span>{formattedTime}</span>
                      {isMine && (
                        <span>
                          {isReadByOthers ? (
                            <CheckCheck className="w-3.5 h-3.5 text-sage-600" title="Read" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-warm-400" title="Sent" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Banner */}
        {typingText && (
          <div className="px-6 py-1 bg-warm-50 text-[11px] text-warm-500 italic flex items-center gap-2 animate-fade-in border-t border-warm-100">
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-warm-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-warm-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-warm-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </span>
            <span>{typingText}</span>
          </div>
        )}

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-warm-200 bg-white flex items-center gap-2.5"
        >
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder={`Message #${activeChat.name}... (Press Enter to send)`}
              value={inputText}
              onChange={handleInputChange}
              className="w-full bg-warm-50 border border-warm-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:bg-white transition-all"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            rightIcon={Send}
            disabled={!inputText.trim() || isSending}
            className="shrink-0"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
