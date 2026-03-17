import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../redux/store';
import { fetchProfile, updateProfile, UserProfile } from '../services/users';
import { fetchUserPosts, Post } from '../services/posts';

// Instagram-like Profile: header with avatar, name, email; stats; grid of user posts

const Profile: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await fetchProfile();
      setProfile(data);
      setName(data.name);
      setBio(data.bio || '');
    } catch (err) {
      console.error('Failed to load profile', err);
      setError('Unable to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadPosts = async (userId: string) => {
    setLoadingPosts(true);
    try {
      const data = await fetchUserPosts(userId);
      setPosts(data.posts);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      loadPosts(profile.id);
    }
  }, [profile?.id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for your avatar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setAvatarFile(file);
        setProfile((prev) => prev && { ...prev, avatar: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError(null);

    try {
      const updates: Partial<UserProfile> = {
        name,
        bio,
      };

      if (avatarFile) {
        // Convert to base64
        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              updates.avatar = reader.result;
              resolve();
            } else {
              reject(new Error('Invalid avatar data'));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(avatarFile);
        });
      }

      const updated = await updateProfile(updates);
      setProfile(updated);
      setEditing(false);
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Failed to update profile', err);
      setError('Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const postsCount = posts.length;
  const imageCount = posts.filter((p) => p.mediaType === 'IMAGE').length;
  const videoCount = posts.filter((p) => p.mediaType === 'VIDEO').length;
  const textCount = posts.filter((p) => !p.mediaType).length;

  if (loadingProfile && !profile) {
    return (
      <div className="p-8 rounded-3xl border border-white/10 bg-white/50 dark:bg-gray-900/50 text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 p-6 backdrop-blur shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent_55%)]" />
        <div className="relative flex flex-col lg:flex-row items-center lg:items-end gap-6">
          <div className="relative">
            <img
              className="h-28 w-28 rounded-full border-4 border-white shadow-lg"
              src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || user?.name || 'User')}&background=6366f1&color=fff`}
              alt={profile?.name || user?.name || 'User'}
            />
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow">
              <span className="text-xs font-semibold">{postsCount}</span>
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.name || user?.name || 'User'}</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{user?.email}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{profile?.bio || 'No bio yet'}</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing((prev) => !prev)}
                  className="px-4 py-2 rounded-2xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 shadow-sm"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
                {editing && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-2xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 justify-center lg:justify-start">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 border border-indigo-200/40">
                {postsCount} posts
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border border-emerald-200/40">
                {imageCount} images
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-200 border border-purple-200/40">
                {videoCount} videos
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 border border-indigo-200/40">
                {textCount} blogs
              </span>
            </div>
          </div>
        </div>

        {editing && (
          <div className="mt-6 rounded-2xl bg-white/70 dark:bg-gray-900/60 p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h2>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 p-3 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/70 dark:bg-gray-900/60 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-white/70 dark:bg-gray-900/60 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-500 file:to-emerald-500 file:text-white hover:file:from-indigo-600 hover:file:to-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Posts Grid */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Posts</h2>
        {loadingPosts ? (
          <div className="p-6 rounded-2xl border border-white/10 text-sm text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-900/50">
            Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 rounded-2xl border border-white/10 text-sm text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-900/50">
            No posts yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((p) => (
              <article
                key={p.id}
                className="relative group rounded-2xl overflow-hidden border border-white/10 bg-white/70 dark:bg-gray-900/60 shadow-sm hover:shadow-md transition"
              >
                {p.mediaType === 'IMAGE' && p.mediaUrl && (
                  <img src={p.mediaUrl} alt={p.content} className="w-full h-44 object-cover" />
                )}
                {p.mediaType === 'VIDEO' && p.mediaUrl && (
                  <video src={p.mediaUrl} className="w-full h-44 object-cover" muted loop playsInline />
                )}
                {(!p.mediaType) && (
                  <div className="p-4 h-44 overflow-hidden">
                    <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-6">{p.content}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition text-[10px] text-white flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-black/40">{p.mediaType || 'TEXT'}</span>
                  <span className="px-2 py-0.5 rounded bg-black/40">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
