import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchBlogPost } from "@/lib/queries";
import { SiteShell } from "@/components/layout/SiteShell";
import { Calendar, User, ChevronLeft, ShieldCheck, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Recovery Guide | ChanAidRecovery Blog" },
      { name: "description", content: "In-depth recovery guide from ChanAidRecovery experts. Learn how to trace, freeze, and reclaim lost funds." },
      { property: "og:title", content: "ChanAidRecovery — Expert Recovery Guide" },
      { property: "og:description", content: "Detailed analysis and recovery strategies for victims of financial fraud and crypto scams." },
    ],
  }),
  loader: async ({ params }) => await fetchBlogPost({ data: params.slug }).catch(() => null),
  component: BlogPost,
});

function BlogPost() {
  const post = Route.useLoaderData();

  if (!post) {
    throw notFound();
  }

  return (
    <SiteShell>
      <article className="bg-white pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
          >
            <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Articles
          </Link>

          <header className="mb-12">
            <div className="flex items-center text-sm text-blue-600 font-semibold tracking-wide uppercase mb-4">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verified Recovery Insight
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-6">
              {post.title}
            </h1>
            <div className="flex items-center justify-between border-y border-slate-100 py-6">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  CA
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{post.author}</div>
                  <div className="text-xs text-slate-500 flex items-center mt-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(post.createdAt || post.created_at), "MMMM d, yyyy")}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </header>

          {(post.featuredImage || post.featured_image) && (
            <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden mb-12 shadow-2xl">
              <img 
                src={post.featuredImage || post.featured_image} 
                alt={post.title} 
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div 
            className="prose prose-lg prose-blue max-w-none text-slate-700
              prose-headings:text-slate-900 prose-headings:font-bold
              prose-a:text-blue-600 prose-strong:text-slate-900
              prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <footer className="mt-16 pt-8 border-t border-slate-100">
            <div className="bg-slate-900 rounded-3xl p-8 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Lost Your Assets to This Type of Scam?</h3>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                  Our forensic experts are standing by to review your case. The faster we act, the higher the recovery probability.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-full shadow-lg shadow-blue-900/20" asChild>
                    <Link to="/contact">Start Free Recovery Audit</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 rounded-full px-8" asChild>
                    <Link to="/loans">Apply for Recovery Loan</Link>
                  </Button>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
            </div>
          </footer>
        </div>
      </article>
    </SiteShell>
  );
}
