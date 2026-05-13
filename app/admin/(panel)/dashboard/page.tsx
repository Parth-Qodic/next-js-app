import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/models";
import StatsCard from "../../components/StatsCard";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const db = await getDb();
  const [totalUsers, totalPosts, publishedPosts, draftPosts, recentUsers, recentPosts] = await Promise.all([
    db.collection(COLLECTIONS.ADMIN_USERS).countDocuments(),
    db.collection(COLLECTIONS.POSTS).countDocuments(),
    db.collection(COLLECTIONS.POSTS).countDocuments({ status: "published" }),
    db.collection(COLLECTIONS.POSTS).countDocuments({ status: "draft" }),
    db.collection(COLLECTIONS.ADMIN_USERS).find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).limit(5).toArray(),
    db.collection(COLLECTIONS.POSTS).find().sort({ createdAt: -1 }).limit(5).toArray(),
  ]);
  return { totalUsers, totalPosts, publishedPosts, draftPosts, recentUsers, recentPosts };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Overview of your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <StatsCard title="Total Users" value={stats.totalUsers} color="indigo" delay={0} icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        } />
        <StatsCard title="Total Posts" value={stats.totalPosts} color="purple" delay={100} icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        } />
        <StatsCard title="Published" value={stats.publishedPosts} color="emerald" delay={200} icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
        <StatsCard title="Drafts" value={stats.draftPosts} color="amber" delay={300} icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        } />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Recent Users
          </h2>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={String(user._id)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center ring-1 ring-white/10">
                  <span className="text-xs font-medium text-indigo-300">{(user.name as string)?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{user.name as string}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email as string}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.role === "admin" ? "status-admin" : "status-editor"}`}>
                  {user.role as string}
                </span>
              </div>
            ))}
            {stats.recentUsers.length === 0 && <p className="text-sm text-zinc-600 text-center py-4">No users yet</p>}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Recent Posts
          </h2>
          <div className="space-y-3">
            {stats.recentPosts.map((post) => (
              <div key={String(post._id)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center ring-1 ring-white/10">
                  <svg className="w-4 h-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{post.title as string}</p>
                  <p className="text-xs text-zinc-500">{post.author as string} · {new Date(post.createdAt as string).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${post.status === "published" ? "status-published" : "status-draft"}`}>
                  {post.status as string}
                </span>
              </div>
            ))}
            {stats.recentPosts.length === 0 && <p className="text-sm text-zinc-600 text-center py-4">No posts yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
