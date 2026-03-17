import React, { useEffect, useMemo, useState } from 'react';
import { fetchPosts, Post } from '../services/posts';

// Posts page: create blog (text), image or video posts with caption

const Posts: React.FC = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    fetchPosts()
      .then((data) => {
        setAllPosts(data.posts);
      })
      .catch((error) => {
        console.error('Failed to load posts', error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const postsSorted = useMemo(() => {
    return [...allPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPosts]);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 p-6 backdrop-blur flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">All blogs, images and videos shared by users.</p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 shadow-sm"
        >
          Refresh
        </button>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Latest Posts</h2>
        {postsSorted.length === 0 ? (
          <div className="p-6 rounded-2xl border border-white/10 text-sm text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-900/50">
            No posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {postsSorted.map((p) => {
              return (
                <article
                  key={p.id}
                  className="rounded-2xl border border-white/10 overflow-hidden bg-white/70 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 p-4 border-b border-white/10">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={
                        p.user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.name)}&background=6366f1&color=fff`
                      }
                      alt={p.user.name}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.user.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {p.mediaType === 'IMAGE' && p.mediaUrl && (
                    <img src={p.mediaUrl} alt={p.content} className="w-full h-48 object-cover" />
                  )}
                  {p.mediaType === 'VIDEO' && p.mediaUrl && (
                    <video src={p.mediaUrl} controls className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 border border-indigo-300/30">
                        {p.mediaType || 'TEXT'}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{p.user.email}</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{p.content}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Posts;
