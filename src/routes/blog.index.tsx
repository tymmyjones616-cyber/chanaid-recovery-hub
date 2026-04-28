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
});

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
        ? <span key={i} className="bg-yellow-100 text-slate-900 px-0.5 rounded">{part}</span> 
        : part
    );
  };

  return (
    <SiteShell>
      <div className="bg-slate-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Latest Insights & Recovery Guides
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-slate-400">
              Expert advice on blockchain forensics, legal recovery paths, and scam prevention across the globe.
            </p>
            <div className="mt-8 max-w-lg mx-auto">
              <input 
                type="search" 
                placeholder="Search articles..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              No articles found. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post: any) => (
                <Link
                  key={post.id}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-xl hover:-translate-y-1 group"
                >
                  <div className="flex-shrink-0 h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {(post.featuredImage || post.featured_image) ? (
                      <img
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        src={post.featuredImage || post.featured_image}
                        alt={post.title}
                      />
                    ) : (
                      <div className="text-slate-700 text-4xl font-bold opacity-20 group-hover:opacity-30 transition-opacity">
                        CHANAID
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-slate-500 mb-3 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(post.createdAt || post.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {highlight(post.title, search)}
                      </h3>
                      <p className="mt-3 text-base text-slate-500 line-clamp-3">
                        {highlight(post.excerpt || "", search)}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-blue-600 font-semibold">
                      Read full article
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
