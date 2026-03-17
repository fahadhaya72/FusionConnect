import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 p-6 shadow-xl">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.5),transparent_50%)]" />
      <div className="relative max-w-4xl mx-auto py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          FusionConnect
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
          One platform for chats, meetings, posts, and collaboration—designed to keep your team connected and productive.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="btn btn-primary px-10 py-3">Get Started</button>
          <button className="btn bg-white/90 text-indigo-700 hover:bg-white text-sm font-semibold shadow-sm">
            Learn More
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Instant Chats', desc: 'Collaborate in real-time with teams and channels.' },
            { title: 'Organized Meetings', desc: 'Keep track of your schedule and stay on top of agendas.' },
            { title: 'Shared Content', desc: 'Post updates, images, and videos that everyone can see.' },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white/20 backdrop-blur border border-white/20 p-6 shadow-lg hover:shadow-xl transition"
            >
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-white/80">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
