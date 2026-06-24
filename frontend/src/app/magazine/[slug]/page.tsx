import { format } from "date-fns";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";

export default async function MagazineArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let article;
  try {
    article = await api.magazine.getById(slug);
  } catch {
    notFound();
  }

  if (!article || !article.isPublished) notFound();

  return (
    <AppShell>
      <article className="mx-auto max-w-3xl px-6 py-8">
        {article.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImageUrl} alt="" className="mb-8 h-64 w-full rounded-lg border border-border object-cover md:h-80" />
        )}
        <header className="mb-8 border-b border-border pb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal">{article.title}</h1>
          <p className="mt-3 text-lg text-muted-fg">{article.summary}</p>
          <p className="mt-4 text-sm text-muted-fg">
            By {article.authorName} · {format(new Date(article.publishedAt ?? article.createdAt), "PPP")}
          </p>
        </header>
        <div className="prose prose-slate max-w-none leading-relaxed text-charcoal/90" dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, "<br />") }} />
      </article>
    </AppShell>
  );
}
