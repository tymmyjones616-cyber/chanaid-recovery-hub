import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { likeBlogPost } from "@/lib/queries";
import { SiteShell } from "@/components/layout/SiteShell";
import { Calendar, User, ChevronLeft, ShieldCheck, Share2, Heart, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthContext";
import { AuthModal } from "@/components/layout/AuthModal";
import { getSupabaseBrowser } from "@/lib/supabase";

export const Route = createFileRoute("/_site/blog/$slug")({
  head: ({ params }: any) => ({
    meta: [
      { title: `Recovery Guide | ChanAidRecovery Hub` },
      { name: "description", content: "Expert crypto recovery guide from ChanAidRecovery Hub forensic specialists." },
      { property: "og:title", content: "Recovery Guide | ChanAidRecovery Hub" },
    ],
  }),
  component: BlogPost,
  errorComponent: ({ error }) => (
    <>
      <div className="max-w-2xl mx-auto py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Unable to load blog post</h1>
        <p className="mt-4 text-slate-600">The recovery guide you are looking for might be temporarily unavailable. Please check back in a few minutes.</p>
        <Link to="/blog" className="mt-8 inline-block text-blue-600 font-semibold hover:underline">Back to Blog</Link>
      </div>
    </>
  ),
  notFoundComponent: () => (
    <>
      <div className="max-w-2xl mx-auto py-24 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Guide not found</h1>
        <p className="mt-4 text-slate-600">We couldn't find the specific recovery guide you requested.</p>
        <Link to="/blog" className="mt-8 inline-block text-blue-600 font-semibold hover:underline">Browse all guides</Link>
      </div>
    </>
  ),
});

function BlogImage({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);
  const fallback = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl mb-12">
      <img
        src={error || !src ? fallback : src}
        alt={alt}
        onError={() => setError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function BlogPost() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    sb.from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        if (data) {
          setPost(data);
          setLikes(data.likes || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!post) {
    throw notFound();
  }

  const handleAction = (to: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = to;
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await likeBlogPost(post.slug);
      setLikes(res.likes);
      toast.success("Thanks for the support!");
    } catch {
      toast.error("Failed to like post.");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <>
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
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-between border-y border-slate-100 py-6">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {post.author?.[0] || "C"}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{post.author}</div>
                  <div className="text-xs text-slate-500 flex items-center mt-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    {(() => {
                      const raw = post.createdAt || post.created_at;
                      if (!raw) return "Recent";
                      const d = new Date(raw);
                      return isNaN(d.getTime()) ? "Recent" : format(d, "MMMM d, yyyy");
                    })()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`flex items-center gap-2 ${likes > 0 ? "text-pink-600 bg-pink-50 hover:bg-pink-100" : "text-slate-500 hover:text-pink-600"}`}
                >
                  <Heart className={`w-4 h-4 ${likes > 0 ? "fill-current" : ""}`} />
                  <span className="font-bold">{likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </header>

          <BlogImage 
            src={post.featuredImage || post.featured_image} 
            alt={`${post.title} - Professional Crypto Recovery Services in USA, UK, Canada, and UAE`} 
          />

          <div
            className="prose prose-lg prose-blue max-w-none text-slate-700
              prose-headings:text-slate-900 prose-headings:font-bold
              prose-a:text-blue-600 prose-strong:text-slate-900
              prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{
              __html:
                post.content ||
                `<p>${post.excerpt || "Full article coming soon — our specialists are finalizing the latest forensic guidance."}</p>`,
            }}
          />

          <footer className="mt-16 pt-8 border-t border-slate-100">
            <div className="bg-slate-900 rounded-3xl p-8 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 italic">Lost Your Assets to This Type of Scam?</h3>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm font-medium">
                  Our forensic experts are standing by to review your case. The faster we act, the higher the recovery probability.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => handleAction("/contact")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-full shadow-lg shadow-blue-900/40 font-bold transition-all hover:scale-105"
                  >
                    Start Free Recovery Audit
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => handleAction("/loans")}
                    className="border-slate-700 text-white hover:bg-slate-800 rounded-full px-10 font-bold"
                  >
                    Apply for Recovery Loan
                  </Button>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
            </div>
          </footer>
        </div>
      </article>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
