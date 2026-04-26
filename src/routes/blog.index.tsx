import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchBlogPosts } from "@/lib/queries";
import { SiteShell } from "@/components/layout/SiteShell";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Recovery Blog | ChanAidRecovery Insights & Guides" },
      { name: "description", content: "Expert guides on crypto scam recovery, blockchain forensics, and fraud prevention. Geo-specific advice for the US, UK, Australia, Canada, UAE, and Saudi Arabia." },
      { property: "og:title", content: "ChanAidRecovery Blog — Recovery Insights & Legal Guides" },
      { property: "og:description", content: "Expert advice on blockchain forensics, legal recovery paths, and scam prevention across the globe." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchBlogPosts,
  });

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
          </div>
        </div>
      </div>

      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-slate-100 h-96 rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map((post) => (
                <Link
                  key={post.id}
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-xl hover:-translate-y-1 group"
                >
                  <div className="flex-shrink-0 h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
                    {post.featured_image ? (
                      <img
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        src={post.featured_image}
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
                          {format(new Date(post.created_at), "MMM d, yyyy")}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {post.author}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-base text-slate-500 line-clamp-3">
                        {post.excerpt}
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
