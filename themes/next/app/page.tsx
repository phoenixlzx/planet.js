import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { loadPlanetData } from "@/lib/data";

function pickPostsLimit<T>(items: number | undefined, data: T[]): T[] {
  if (!items || items <= 0) {
    return data;
  }

  return data.slice(0, items);
}

const data = loadPlanetData();
const posts = pickPostsLimit(data.site.items, data.posts);

export default function Home() {
  const displayLength = data.site.display_length ?? Number.MAX_SAFE_INTEGER;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 pb-16 pt-10 md:px-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {data.site.name}
            </h1>
            {data.site.tagline ? (
              <p className="text-muted-foreground text-base">
                {data.site.tagline}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 self-start">
            <Button asChild variant="link">
              <a href="atom.xml">Atom</a>
            </Button>
            <Button asChild variant="link">
              <a href="rss.xml">RSS</a>
            </Button>
            <ModeToggle />
          </div>
        </div>
        {data.site.description ? (
          <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
            {data.site.description}
          </p>
        ) : null}
      </header>

      <main className="flex flex-col gap-10">
        <section className="space-y-6">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold">Recent posts</h2>
            <p className="text-muted-foreground text-sm">
              {posts.length} of {data.posts.length} loaded
            </p>
          </div>

          <div className="space-y-6">
            {posts.map((post) => {
              const content =
                post._length > displayLength && post.summary
                  ? post.summary
                  : post.content;
              const authorName = (post.author ?? "").trim() || "Unknown";
              const fallbackInitials =
                authorName.slice(0, 2).toUpperCase() || "??";

              return (
                <Card key={`${post._t_rfc3339}-${post.link}`}>
                  <CardHeader className="gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        {post.avatar ? (
                          <AvatarImage src={post.avatar} alt={authorName} />
                        ) : null}
                        <AvatarFallback>{fallbackInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col gap-2">
                        <CardTitle className="text-pretty text-lg font-semibold md:text-xl">
                          <a
                            href={post.link}
                            className="text-foreground transition-colors hover:text-primary"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {post.title}
                          </a>
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span>{authorName}</span>
                          <span aria-hidden="true">•</span>
                          <time dateTime={post._t_rfc3339}>{post.date}</time>
                          {post.update && post.update !== post.date ? (
                            <>
                              <span aria-hidden="true">•</span>
                              <span>Updated {post.update}</span>
                            </>
                          ) : null}
                        </CardDescription>
                        {post.categories.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {post.categories.map((category) => (
                              <Badge key={category} variant="secondary">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="post-content"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </CardContent>
                  <CardFooter className="justify-between gap-4">
                    <Button asChild variant="link" className="px-0">
                      <a
                        href={post.link}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Continue reading
                      </a>
                    </Button>
                    <Button asChild variant="link" className="px-0 text-sm">
                      <a
                        href={post.channel}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Visit source
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        {data.people.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Sources</h2>
            <div className="flex flex-wrap gap-2">
              {data.people.map((person) => (
                <Button
                  key={person.link}
                  asChild
                  variant="link"
                  className="px-1 text-sm"
                >
                  <a
                    href={person.link}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {person.name}
                  </a>
                </Button>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
