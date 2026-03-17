import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../redux/store';
import { fetchContacts, acceptContactRequest, rejectContactRequest, sendContactRequest, ContactItem, searchUsers, ContactUser } from '../services/contacts';
import { createChat } from '../services/chats';

// Responsive Contacts page with searchable list and profile preview
const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Array<{ id: string; user: any; createdAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [messagingUserId, setMessagingUserId] = useState<string | null>(null);
  const [callingUserId, setCallingUserId] = useState<string | null>(null);

  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContactUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchContacts()
      .then((data) => {
        if (!mounted) return;
        setContacts(data.contacts);
        setPendingRequests(data.pendingRequests);
      })
      .catch((error) => {
        console.error('Failed to load contacts', error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return contacts.filter((c) =>
      c.user.name.toLowerCase().includes(lower) || c.user.bio?.toLowerCase().includes(lower)
    );
  }, [contacts, query]);

  const handleUserSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      // Filter out current user and existing contacts
      const currentUserId = currentUser?.id;
      const contactIds = new Set(contacts.map(c => c.user.id));
      const filteredResults = results.filter(user =>
        user.id !== currentUserId && !contactIds.has(user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Failed to search users', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setSendingRequest(userId);
    try {
      await sendContactRequest(userId);
      // Remove from search results
      setSearchResults(prev => prev.filter(user => user.id !== userId));
      // Could add to pending sent requests if backend supports it
    } catch (error) {
      console.error('Failed to send friend request', error);
    } finally {
      setSendingRequest(null);
    }
  };

  const handleMessage = async (userId: string) => {
    setMessagingUserId(userId);
    try {
      // Create or get existing chat
      await createChat([userId], undefined, 'DIRECT');
      // Navigate to chats page
      navigate('/chats');
    } catch (error) {
      console.error('Failed to create chat', error);
    } finally {
      setMessagingUserId(null);
    }
  };

  const handleCall = (userId: string, type: 'VOICE' | 'VIDEO') => {
    setCallingUserId(userId);
    try {
      // TODO: Implement socket.io call initiation
      // For now, show alert
      alert(`${type} call feature coming soon! Calling ${contacts.find(c => c.user.id === userId)?.user.name}`);
    } finally {
      setCallingUserId(null);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleUserSearch(searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 p-6 backdrop-blur">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Find and connect with your teammates with a modern directory.</p>
      </header>

      {/* User Search Section */}
      <section className="rounded-3xl border border-white/10 bg-white/60 dark:bg-gray-900/50 backdrop-blur p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Find New Friends</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for users by name or email..."
            className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />

          {searching && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">Searching...</div>
          )}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((user) => (
                <div key={user.id} className="p-4 rounded-2xl border border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                      alt={user.name}
                      className="h-10 w-10 rounded-full ring-2 ring-white/40"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.bio || user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      disabled={sendingRequest === user.id}
                      className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 disabled:opacity-60"
                    >
                      {sendingRequest === user.id ? 'Sending...' : 'Send Friend Request'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && !searching && searchResults.length === 0 && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              No users found matching "{searchQuery}"
            </div>
          )}
        </div>
      </section>

      {pendingRequests.length > 0 && (
        <section className="rounded-3xl border border-white/10 bg-white/60 dark:bg-gray-900/50 backdrop-blur p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Requests</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Approve or decline incoming contact requests.</p>
          <div className="mt-4 grid gap-4">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/70 dark:bg-gray-900/60">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{req.user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setProcessingRequest(req.id);
                      try {
                        await acceptContactRequest(req.id);
                        setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
                        setContacts((prev) => prev.concat({
                          id: req.id,
                          user: req.user,
                          status: 'ACCEPTED',
                          createdAt: req.createdAt
                        }));
                      } catch (error) {
                        console.error('Failed to accept request', error);
                      } finally {
                        setProcessingRequest(null);
                      }
                    }}
                    disabled={processingRequest === req.id}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/30"
                  >
                    {processingRequest === req.id ? 'Accepting…' : 'Accept'}
                  </button>
                  <button
                    onClick={async () => {
                      setProcessingRequest(req.id);
                      try {
                        await rejectContactRequest(req.id);
                        setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
                      } catch (error) {
                        console.error('Failed to reject request', error);
                      } finally {
                        setProcessingRequest(null);
                      }
                    }}
                    disabled={processingRequest === req.id}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-red-700 bg-red-100/70 hover:bg-red-100 dark:text-red-200 dark:bg-red-900/30"
                  >
                    {processingRequest === req.id ? 'Declining…' : 'Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="bg-white/60 dark:bg-gray-900/50 backdrop-blur rounded-3xl border border-white/10 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your contacts..."
            className="flex-1 px-4 py-3 rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-900/70 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button className="px-4 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 shadow-sm">
            Invite Contact
          </button>
        </div>

        {loading ? (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">Loading contacts...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center text-sm text-gray-500 dark:text-gray-400">
                No contacts found. Try a different search.
              </div>
            ) : (
              filtered.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl border border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user.name)}&background=6366f1&color=fff`}
                      alt={c.user.name}
                      className="h-12 w-12 rounded-full ring-2 ring-white/40"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{c.user.bio || c.user.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleMessage(c.user.id)}
                      disabled={messagingUserId === c.user.id}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {messagingUserId === c.user.id ? 'Creating...' : 'Message'}
                    </button>
                    <button
                      onClick={() => handleCall(c.user.id, 'VIDEO')}
                      disabled={callingUserId === c.user.id}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-100 dark:text-emerald-200 dark:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {callingUserId === c.user.id ? 'Calling...' : 'Call'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
