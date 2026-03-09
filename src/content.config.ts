import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const site = defineCollection({
  loader: glob({ base: './src/content/site', pattern: '**/*.{yml,yaml}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    profileImageAlt: z.string(),
    hero: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      intro: z.string(),
      primaryCtaLabel: z.string(),
      secondaryCtaLabel: z.string(),
    }),
    about: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()).min(1),
    }),
    contact: z.object({
      title: z.string(),
      links: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
            handle: z.string(),
          }),
        )
        .min(1),
    }),
    projects: z.object({
      title: z.string(),
      items: z
        .array(
          z.object({
            name: z.string(),
            href: z.string(),
            description: z.string(),
          }),
        )
        .min(1),
    }),
  }),
});

export const collections = { site };
