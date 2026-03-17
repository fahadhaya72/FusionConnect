import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../redux/store';
import { fetchChats, fetchChatMessages, sendChatMessage, ChatSummary, Message } from '../services/chats';

// Unique chat UI: cyan-magenta gradient accents, glass panels, bubbly message bubbles
// No external UI kit; pure Tailwind classes assumed from project
const Chats: React.FC = () => {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserName = currentUser?.name || 'You';

  const activeChat = useMemo(() => chats.find((c) => c.id === activeChatId) ?? null, [chats, activeChatId]);

  useEffect(() => {
    let mounted = true;
    setLoadingChats(true);

    fetchChats()
      .then((data) => {
        if (!mounted) return;
        setChats(data);
        if (!activeChatId && data.length) {
          setActiveChatId(data[0].id);
        }
      })
      .catch((error) => {
        console.error('Failed to load chats', error);
      })
      .finally(() => {
        if (mounted) setLoadingChats(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    let mounted = true;
    setLoadingMessages(true);

    fetchChatMessages(activeChatId)
      .then((data) => {
        if (!mounted) return;
        setMessages(data.messages);
      })
      .catch((error) => {
        console.error('Failed to load messages', error);
        setMessages([]);
      })
      .finally(() => {
        if (mounted) setLoadingMessages(false);
      });

    return () => {
      mounted = false;
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
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Left: chat list */}
      <aside className="md:col-span-4 lg:col-span-3 bg-white/60 dark:bg-gray-900/50 backdrop-blur rounded-3xl border border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-white/15 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-200">{chats.length} groups</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Pick a room to get started</p>
        </div>
        <div className="divide-y divide-white/10 max-h-[calc(100vh-15rem)] overflow-y-auto">
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
                  {c.unreadCount && c.unreadCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white">{c.unreadCount}</span>
                  )}
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
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{activeChat?.name ?? 'Select a chat'}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {activeChat ? 'Messages are fetched from the backend' : 'Pick a chat to start messaging'}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 p-5 space-y-3 overflow-y-auto">
          {loadingMessages ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading messages…</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Say hi!</div>
          ) : (
            messages.map((m) => {
              const mine = m.sender.name === currentUserName || m.sender.id === currentUser?.id;
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
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="p-5 border-t border-white/10 bg-white/40 dark:bg-gray-900/30">
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
    </div>
  );
};

export default Chats;
