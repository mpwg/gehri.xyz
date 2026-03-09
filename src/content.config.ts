import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseSection = {
  id: z.string(),
  navLabel: z.string(),
  tag: z.string(),
  title: z.string(),
};

const site = defineCollection({
  loader: glob({ base: './src/content/site', pattern: '**/*.{yml,yaml}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    brand: z.string(),
    hero: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      intro: z.string(),
      primaryCta: z.object({
        label: z.string(),
        href: z.string(),
      }),
      secondaryCta: z.object({
        label: z.string(),
        href: z.string(),
      }),
      image: z.object({
        src: z.string(),
        alt: z.string(),
      }),
    }),
    sections: z
      .array(
        z.discriminatedUnion('type', [
          z.object({
            type: z.literal('text'),
            ...baseSection,
            layout: z.enum(['single', 'two-column']),
            paragraphs: z.array(z.string()).min(1),
          }),
          z.object({
            type: z.literal('links'),
            ...baseSection,
            items: z
              .array(
                z.object({
                  label: z.string(),
                  href: z.string(),
                  value: z.string(),
                }),
              )
              .min(1),
          }),
          z.object({
            type: z.literal('projects'),
            ...baseSection,
            items: z
              .array(
                z.object({
                  name: z.string(),
                  href: z.string(),
                  description: z.string(),
                  ctaLabel: z.string(),
                }),
              )
              .min(1),
          }),
          z.object({
            type: z.literal('image'),
            ...baseSection,
            src: z.string(),
            alt: z.string(),
            caption: z.string().optional(),
          }),
        ]),
      )
      .min(1),
  }),
});

export const collections = { site };
