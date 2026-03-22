import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../redux/store';
import { 
  fetchChats, 
  fetchChatMessages, 
  sendChatMessage,
  createGroup, 
  deleteGroup, 
  kickUser,
  muteUser,
  unmuteUser,
  ChatSummary, 
  Message 
} from '../services/chats';
import { createCall, getUserCalls } from '../services/calls';
import api from '../services/api';
import { CallModal } from '../components/CallModal';

// Unique chat UI: cyan-magenta gradient accents, glass panels, bubbly message bubbles
// No external UI kit; pure Tailwind classes assumed from project
const Chats: React.FC = () => {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showCallDropdown, setShowCallDropdown] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [friends, setFriends] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const callDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserName = currentUser?.name || 'You';

  const activeChat = useMemo(() => chats.find((c) => c.id === activeChatId) ?? null, [chats, activeChatId]);
  const isAdmin = activeChat?.createdBy === currentUser?.id;

  // Fetch friends with debouncing to avoid rate limiting
  useEffect(() => {
    let mounted = true;
    const fetchFriendsWithDebounce = setTimeout(async () => {
      if (!mounted) return;
      try {
        setLoadingFriends(true);
        const response = await api.get('/contacts');
        
        // Handle different response structures
        let contactsData;
        if (Array.isArray(response.data)) {
          contactsData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          contactsData = response.data.data;
        } else {
          contactsData = [];
        }
        
        // Filter only accepted contacts as friends
        const acceptedContacts = contactsData.filter((contact: any) => 
          contact.status === 'ACCEPTED' && 
          (contact.userId === currentUser?.id || contact.contactId === currentUser?.id)
        );
        
        // Transform to friends format
        const friendsList = acceptedContacts.map((contact: any) => ({
          id: contact.userId === currentUser?.id ? contact.contactId : contact.userId,
          name: contact.userId === currentUser?.id ? contact.contact?.name : contact.user?.name
        }));
        
        setFriends(friendsList);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
        setFriends([]);
      } finally {
        if (mounted) setLoadingFriends(false);
      }
    }, 600); // Debounce for 600ms

    return () => {
      mounted = false;
      clearTimeout(fetchFriendsWithDebounce);
    };
  }, [currentUser?.id]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (callDropdownRef.current && !callDropdownRef.current.contains(event.target as Node)) {
        setShowCallDropdown(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch chats with debouncing to avoid rate limiting
  useEffect(() => {
    let mounted = true;
    const fetchChatsWithDebounce = setTimeout(async () => {
      if (!mounted) return;
      try {
        setLoadingChats(true);
        const data = await fetchChats();
        if (mounted) {
          setChats(data);
          if (!activeChatId && data.length) {
            setActiveChatId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      } finally {
        if (mounted) setLoadingChats(false);
      }
    }, 500); // Debounce for 500ms

    return () => {
      mounted = false;
      clearTimeout(fetchChatsWithDebounce);
    };
  }, []);

  // Fetch messages when chat changes
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    let mounted = true;
    const fetchMessagesWithDebounce = setTimeout(async () => {
      if (!mounted) return;
      try {
        setLoadingMessages(true);
        const data = await fetchChatMessages(activeChatId);
        if (mounted) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessages([]);
      } finally {
        if (mounted) setLoadingMessages(false);
      }
    }, 300); // Debounce for 300ms

    return () => {
      mounted = false;
      clearTimeout(fetchMessagesWithDebounce);
    };
  }, [activeChatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChatId) return;

    try {
      const sent = await sendChatMessage(activeChatId, text.trim());
      setMessages((prev) => [...prev, sent]);
      setText('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleVoiceCall = async () => {
    if (!activeChat || activeChat.type !== 'DIRECT') return;
    
    try {
      const otherUserId = activeChat.participants.find(p => p.id !== currentUser?.id)?.id;
      if (otherUserId) {
        const call = await createCall(otherUserId, 'VOICE', activeChatId || undefined);
        console.log('Voice call initiated:', call);
        setActiveCall(call);
        setShowIncomingCallModal(true);
      }
    } catch (error) {
      console.error('Failed to initiate voice call:', error);
    }
  };

  const handleVideoCall = async () => {
    if (!activeChat || activeChat.type !== 'DIRECT') return;
    
    try {
      const otherUserId = activeChat.participants.find(p => p.id !== currentUser?.id)?.id;
      if (otherUserId) {
        const call = await createCall(otherUserId, 'VIDEO', activeChatId || undefined);
        console.log('Video call initiated:', call);
        setActiveCall(call);
        setShowIncomingCallModal(true);
      }
    } catch (error) {
      console.error('Failed to initiate video call:', error);
    }
  };

  const handleAnswerCall = () => {
    console.log('Call answered');
    setShowIncomingCallModal(false);
    // TODO: Start WebRTC connection
  };

  const handleRejectCall = () => {
    console.log('Call rejected');
    setShowIncomingCallModal(false);
    setActiveCall(null);
    // TODO: End call in backend
  };

  const handleEndCall = () => {
    console.log('Call ended');
    setShowIncomingCallModal(false);
    setActiveCall(null);
    // TODO: End call in backend
  };

  const handleCreateGroup = async () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      try {
        const newGroup = await createGroup(groupName.trim(), selectedUsers);
        setChats(prev => [newGroup, ...prev]);
        setGroupName('');
        setSelectedUsers([]);
        setShowGroupModal(false);
        setActiveChatId(newGroup.id);
      } catch (error) {
        console.error('Failed to create group:', error);
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (activeChatId && isAdmin) {
      try {
        await deleteGroup(activeChatId);
        setChats(prev => prev.filter(chat => chat.id !== activeChatId));
        setActiveChatId(null);
        setShowManageModal(false);
      } catch (error) {
        console.error('Failed to delete group:', error);
      }
    }
  };

  const handleKickUser = async (userId: string) => {
    if (activeChatId && isAdmin) {
      try {
        await kickUser(activeChatId, userId);
        setMutedUsers(prev => prev.filter(id => id !== userId));
      } catch (error) {
        console.error('Failed to kick user:', error);
      }
    }
  };

  const handleMuteUser = async (userId: string) => {
    if (activeChatId && isAdmin) {
      try {
        if (mutedUsers.includes(userId)) {
          await unmuteUser(activeChatId, userId);
          setMutedUsers(prev => prev.filter(id => id !== userId));
        } else {
          await muteUser(activeChatId, userId);
          setMutedUsers(prev => [...prev, userId]);
        }
      } catch (error) {
        console.error('Failed to mute/unmute user:', error);
      }
    }
  };

  const handleScheduleMeeting = async () => {
    if (activeChatId) {
      try {
        const meetingTime = prompt('Schedule meeting time (e.g., 2024-03-22 14:00):');
        if (meetingTime) {
          // Create meeting for this group
          const response = await api.post('/meetings', {
            title: `${activeChat?.name} Meeting`,
            startTime: meetingTime,
            participantIds: activeChat?.participants.map(p => p.id) || [],
            chatId: activeChatId
          });
          console.log('Meeting scheduled:', response.data);
        }
      } catch (error) {
        console.error('Failed to schedule meeting:', error);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Left: chat list */}
      <aside className="md:col-span-4 lg:col-span-3 bg-white/60 dark:bg-gray-900/50 backdrop-blur rounded-3xl border border-white/10 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/15 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGroupModal(true)}
                className="text-xs px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-500/25 transition"
              >
                + Group
              </button>
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-200">{chats.length} groups</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pick a room to get started</p>
        </div>
        <div className="flex-1 divide-y divide-white/10 overflow-y-auto min-h-0">
          {loadingChats ? (
            <div className="p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading chats...</p>
            </div>
          ) : (
            chats.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                className={`w-full text-left px-5 py-4 transition ${
                  activeChatId === c.id
                    ? 'bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 text-indigo-900 dark:text-white'
                    : 'text-gray-700 hover:bg-white/50 dark:text-gray-200 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{c.name}</p>
                  <div className="flex items-center gap-2">
                    {c.createdBy === currentUser?.id && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-200">Admin</span>
                    )}
                    {c.unreadCount && c.unreadCount > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white">{c.unreadCount}</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{c.lastMessage?.content ?? 'No messages yet'}</p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Right: conversation */}
      <section className="md:col-span-8 lg:col-span-9 bg-white/60 dark:bg-gray-900/50 backdrop-blur rounded-3xl border border-white/10 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{activeChat?.name ?? 'Select a chat'}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeChat ? 'Messages are fetched from backend' : 'Pick a chat to start messaging'}
              </p>
            </div>
            <div className="flex items-center gap-2" ref={callDropdownRef}>
              {/* Call Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCallDropdown(!showCallDropdown);
                    setShowSettingsDropdown(false); // Close settings when opening call
                  }}
                  className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition"
                >
                  📞
                </button>
                {showCallDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <button
                      onClick={() => {
                        setShowCallDropdown(false);
                        handleVoiceCall();
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      📞 Voice Call
                    </button>
                    <button
                      onClick={() => {
                        setShowCallDropdown(false);
                        handleVideoCall();
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      📹 Video Call
                    </button>
                  </div>
                )}
              </div>

              {/* Settings Dropdown */}
              <div className="relative" ref={settingsDropdownRef}>
                <button
                  onClick={() => {
                    setShowSettingsDropdown(!showSettingsDropdown);
                    setShowCallDropdown(false); // Close call when opening settings
                  }}
                  className="p-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 transition"
                >
                  ⚙️
                </button>
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        handleScheduleMeeting();
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      📅 Schedule Meeting with User
                    </button>
                    <button
                      onClick={() => {
                        setShowSettingsDropdown(false);
                        // TODO: Implement user deletion
                        if (activeChat && activeChat.type === 'DIRECT' && activeChat.participants.length === 2) {
                          console.log('Delete user chat option clicked');
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 text-red-600"
                      disabled={!activeChat || activeChat.type !== 'DIRECT' || activeChat.participants.length !== 2}
                    >
                      �️ Delete User
                    </button>
                  </div>
                )}
              </div>

              {/* Group Management Button (only for admins) */}
              {activeChat && isAdmin && (
                <button
                  onClick={() => setShowManageModal(true)}
                  className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition"
                >
                  ⚙️
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 p-5 space-y-3 overflow-y-auto min-h-0"
        >
          {loadingMessages ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading messages…</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Say hi!</div>
          ) : (
            messages.map((m) => {
              const mine = m.sender.name === currentUserName || m.sender.id === currentUser?.id;
              const isMuted = mutedUsers.includes(m.sender.id);
              
              if (isMuted && !mine) {
                return (
                  <div key={m.id} className="text-center text-sm text-gray-400 italic">
                    Message from {m.sender.name} (muted)
                  </div>
                );
              }

              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] md:max-w-md p-4 rounded-2xl shadow-sm border text-sm ${
                      mine
                        ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white border-indigo-300/30'
                        : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 border-white/20 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2 opacity-80 text-[11px]">
                      <span className="font-semibold">{mine ? 'You' : m.sender.name}</span>
                      <span>•</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed">{m.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer - Fixed at bottom */}
        <form onSubmit={handleSend} className="p-5 border-t border-white/10 bg-white/40 dark:bg-gray-900/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 shadow-sm transition"
            >
              Send
            </button>
          </div>
        </form>
      </section>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create Group</h3>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 mb-4"
            />
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Select friends:</p>
              {loadingFriends ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading friends...</div>
              ) : friends.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No friends available. Add contacts first!</div>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                  {friends.map((friend) => (
                    <label key={friend.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(friend.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, friend.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== friend.id));
                          }
                        }}
                      />
                      <span>{friend.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateGroup}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Create
              </button>
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Group Modal */}
      {showManageModal && activeChat && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Manage Group: {activeChat.name}</h3>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Group Members:</p>
              <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                {activeChat.participants?.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2">
                    <span>{participant.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMuteUser(participant.id)}
                        className={`text-xs px-2 py-1 rounded ${
                          mutedUsers.includes(participant.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {mutedUsers.includes(participant.id) ? 'Unmute' : 'Mute'}
                      </button>
                      {participant.id !== currentUser?.id && (
                        <button
                          onClick={() => handleKickUser(participant.id)}
                          className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Kick
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteGroup}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Group
              </button>
              <button
                onClick={() => setShowManageModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showIncomingCallModal && activeCall && (
        <CallModal
          call={activeCall}
          onClose={() => {
            setShowIncomingCallModal(false);
            setActiveCall(null);
          }}
          onAnswer={handleAnswerCall}
          onReject={handleRejectCall}
          onEnd={handleEndCall}
        />
      )}
    </div>
  );
};

export default Chats;
