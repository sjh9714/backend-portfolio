import type { Project } from "@/content/types";
import { profile } from "@/content/profile";
import { projects } from "@/content/projects";

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function HomeJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Person",
            name: profile.name,
            jobTitle: "Backend Developer",
            email: `mailto:${profile.email}`,
            url: profile.siteUrl,
            sameAs: [profile.github],
          },
          {
            "@type": "ItemList",
            name: "프로젝트 — 요청의 여정",
            itemListElement: projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.name,
              url: `${profile.siteUrl}/projects/${p.slug}`,
            })),
          },
        ],
      }}
    />
  );
}

export function ProjectJsonLd({ project }: { project: Project }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SoftwareSourceCode",
            name: project.name,
            description: project.oneLiner,
            codeRepository: project.links.github,
            programmingLanguage: project.stack[0],
            author: { "@type": "Person", name: profile.name, url: profile.siteUrl },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "홈", item: profile.siteUrl },
              {
                "@type": "ListItem",
                position: 2,
                name: project.name,
                item: `${profile.siteUrl}/projects/${project.slug}`,
              },
            ],
          },
        ],
      }}
    />
  );
}
