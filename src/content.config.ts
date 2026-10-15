import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import projectTags from './data/project-tags.json';

const projectTagIds = projectTags.map((tag) => tag.id);
const projectMediaPath = z.string().regex(
  /^\/[a-z0-9]+(?:-[a-z0-9]+)*\/[^/]+\.(?:png|jpe?g|webp|avif|gif|svg|mp4|webm|ogg|mov)$/i,
  'Usa /nombre-del-proyecto/archivo.ext; guarda el archivo en public/images/work/nombre-del-proyecto/'
);

const projects = defineCollection({
  loader: glob({ pattern: ['**/*.{md,mdx}', '!_template.md'], base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    services: z.string(),
    year: z.number(),
    location: z.string().optional(),
    externalUrl: z.string().optional(),
    siteText: z.string().optional(),
    cardImage: projectMediaPath,
    cardAlt: z.string(),
    images: z.array(z.object({
      src: projectMediaPath,
      background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Usa un color hexadecimal de seis dígitos').optional(),
      alt: z.string().optional()
    })).min(1),
    tags: z.array(z.string()).min(1).refine(
      (tags) => tags.every((tag) => projectTagIds.includes(tag)),
      { message: 'Cada tag debe existir en src/data/project-tags.json' }
    ),
    showOnHome: z.boolean().default(false),
    homeOrder: z.number().int().min(1).max(3).optional(),
    order: z.number().default(0)
  }).superRefine((project, context) => {
    if (!project.externalUrl && !project.siteText) {
      context.addIssue({
        code: 'custom',
        path: ['externalUrl'],
        message: 'Define externalUrl o siteText para “Ir al sitio”'
      });
    }

    if (project.showOnHome && !project.homeOrder) {
      context.addIssue({
        code: 'custom',
        path: ['homeOrder'],
        message: 'Los proyectos visibles en Home necesitan una posición del 1 al 3'
      });
    }
  })
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    position: z.string(),
    image: image(),
    message: z.string(),
    order: z.number().default(0)
  })
});

export const collections = { projects, testimonials };
