import React, { useEffect, useState } from 'react';
import { fetchMeetings, Meeting } from '../services/meetings';

// Responsive Meetings page using cyan-magenta accent, timeline + upcoming card
const Meetings: React.FC = () => {
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [past, setPast] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchMeetings()
      .then((data) => {
        if (!mounted) return;
        setUpcoming(data.upcoming);
        setPast(data.past);
      })
      .catch((error) => {
        console.error('Failed to load meetings', error);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 p-6 backdrop-blur">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Plan, join, and track your meetings in one place.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white/60 dark:bg-gray-900/50 backdrop-blur rounded-3xl border border-white/10 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading meetings…</div>
            ) : past.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No meetings scheduled yet.</div>
            ) : (
              past.map((m) => (
                <div key={m.id} className="flex items-start gap-3 bg-white/70 dark:bg-gray-900/60 rounded-2xl p-4 border border-white/10 hover:border-indigo-300/40 transition">
                  <div className={`mt-1 h-3 w-3 rounded-full ${m.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{m.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(m.startTime).toLocaleString()} • {m.status}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 text-xs rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 shadow-sm">
                    Details
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="bg-white/60 dark:bg-gray-900/50 backdrop-blur rounded-3xl border border-white/10 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming</h2>
            <button className="px-3 py-1.5 text-xs rounded-xl font-semibold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/30">
              + New
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading upcoming meetings…</div>
            ) : upcoming.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No upcoming meetings. Schedule one to get started.</div>
            ) : (
              upcoming.map((u) => (
                <div key={u.id} className="p-4 rounded-2xl border border-white/10 bg-white/70 dark:bg-gray-900/60">
                  <p className="font-medium text-gray-900 dark:text-white">{u.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(u.startTime).toLocaleString()} • Host: {u.organizer.name}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Meetings;
