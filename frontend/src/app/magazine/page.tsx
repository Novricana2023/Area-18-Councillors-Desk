import Link from "next/link";
import { format } from "date-fns";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";

async function getArticles() {
  try {
    return await api.magazine.getPublished();
  } catch {
    return [];
  }
}

export default async function MagazinePage() {
  const articles = await getArticles();

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <PageHeader
          title="Area 18 Magazine"
          subtitle="Stories, development updates, and community highlights from our ward"
        />

        {articles.length === 0 ? (
          <p className="text-sm text-muted-fg">No published articles yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/magazine/${article.id}`}
                className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-navy/30 hover:shadow-sm"
              >
                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt="" className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-navy text-sm font-medium text-white/40">
                    Area 18
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-base font-semibold text-charcoal group-hover:text-navy">{article.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-fg">{article.summary}</p>
                  <p className="mt-3 text-xs text-muted-fg">
                    {article.authorName} · {format(new Date(article.publishedAt ?? article.createdAt), "PPP")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
