import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchBlogPosts } from "@/lib/queries";
import { SiteShell } from "@/components/layout/SiteShell";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Recovery Blog | ChanAidRecovery Insights & Guides" },
      { name: "description", content: "Expert guides on crypto scam recovery, blockchain forensics, and fraud prevention. Geo-specific advice for the US, UK, Australia, Canada, UAE, and Saudi Arabia." },
      { property: "og:title", content: "ChanAidRecovery Blog — Recovery Insights & Legal Guides" },
      { property: "og:description", content: "Expert advice on blockchain forensics, legal recovery paths, and scam prevention across the globe." },
    ],
  }),
  loader: async () => (await fetchBlogPosts().catch(() => [])) ?? [],
  component: BlogIndex,
});function BlogImage({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);
  const fallback = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
      <img
        src={error || !src ? fallback : src}
        alt={alt}
        onError={() => setError(true)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-slate-900/10 rounded-2xl pointer-events-none" />
    </div>
  );
}

function BlogIndex() {
  const posts = Route.useLoaderData();
  const [search, setSearch] = useState("");

  const filteredPosts = posts?.filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.excerpt?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const highlight = (text: string | null | undefined, query: string) => {
    if (!query || !text) return text || "";
    const parts = String(text).split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <span key={i} className="bg-blue-50 text-blue-700 font-medium px-0.5 rounded">{part}</span> 
        : part
    );
  };

  return (
    <SiteShell>
      <div className="relative bg-slate-900 pt-32 pb-24 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-black text-white sm:text-6xl tracking-tight leading-tight">
              Recovery <span className="text-blue-400">Insights</span> & Forensic Guides
            </h1>
            <p className="mt-6 text-xl text-slate-400 leading-relaxed">
              Authoritative advice on blockchain forensics, international recovery protocols, and fraud prevention from the world's leading specialists.
            </p>
            <div className="mt-10 max-w-lg mx-auto relative group">
              <input 
                type="search" 
                placeholder="Search articles by topic, scam type, or keyword..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15 transition-all shadow-2xl backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 py-24 min-h-[600px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-32">
              <div className="bg-white rounded-3xl p-12 shadow-soft border border-slate-100 max-w-sm mx-auto">
                <p className="text-slate-500 font-medium">No articles found. Check back soon!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredPosts.map((post: any) => (
                <Link
                  key={post.id}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="flex flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white transition-all duration-500 hover:shadow-elegant hover:-translate-y-2 group"
                >
                  <BlogImage 
                    src={post.featuredImage || post.featured_image} 
                    alt={post.title} 
                  />
                  
                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div className="flex-1">
                      <div className="flex items-center text-[0.75rem] font-bold uppercase tracking-widest text-slate-400 mb-4 space-x-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          {format(new Date(post.createdAt || post.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-blue-500" />
                          {post.author.split(',')[0]}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-4">
                        {highlight(post.title, search)}
                      </h3>
                      <p className="text-[1rem] text-slate-500 leading-relaxed line-clamp-3 mb-6">
                        {highlight(post.excerpt || "", search)}
                      </p>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-blue-600 font-bold text-sm uppercase tracking-wider flex items-center group-hover:gap-2 transition-all">
                        Read Analysis
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {post.likes > 999 ? (post.likes / 1000).toFixed(1) + 'k' : post.likes}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
}
