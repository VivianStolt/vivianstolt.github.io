// Auto-load project metadata and images from src/assets/projects/*
export async function loadProjects() {
  // import metadata files eagerly using Vite's glob
  const metaModules = import.meta.glob('../assets/projects/*/metadata.json', { eager: true });
  const imageModules = import.meta.glob('../assets/projects/*/*.{png,jpg,jpeg,svg,webp}', { eager: true });

  const projectsBySlug = {};

  // collect metadata
  for (const path in metaModules) {
    const mod = metaModules[path];
    // path example: ../assets/projects/slug/metadata.json
    const parts = path.split('/');
    const slug = parts[parts.length - 2];
    const data = (mod && mod.default) ? mod.default : mod;
    projectsBySlug[slug] = { ...data, slug, images: [] };
  }

  // collect images and assign to slug
  for (const path in imageModules) {
    const mod = imageModules[path];
    const parts = path.split('/');
    const slug = parts[parts.length - 2];
    const url = (mod && mod.default) ? mod.default : mod;
    if (!projectsBySlug[slug]) {
      // if no metadata exists yet, create a minimal entry
      projectsBySlug[slug] = { slug, title: slug, year: '', description: '', tags: [], images: [url] };
    } else {
      projectsBySlug[slug].images.push(url);
    }
  }

  // Resolve optional 'cover' (or 'hero') filename from metadata to an actual image URL
  // If metadata contains e.g. "cover": "Electrician4.png", map it to the bundled URL
  for (const slug in projectsBySlug) {
    const p = projectsBySlug[slug];
    const imgs = p.images || [];
    const coverName = p.cover || p.hero || null;
    if (coverName) {
      // try exact include, decoded include, or basename match
      let found = imgs.find(i => i && i.includes(coverName));
      if (!found) {
        found = imgs.find(i => {
          try { return i && decodeURIComponent(i).includes(coverName); } catch (e) { return false; }
        });
      }
      if (!found) {
        const base = String(coverName).replace(/\.[^.]+$/, '');
        // try matching by base name without extension and allow prefix/contains match
        found = imgs.find(i => {
          try {
            const name = String(i).split('/').pop() || '';
            const baseName = name.replace(/\.[^.]+$/, '');
            return baseName === base || baseName.startsWith(base) || baseName.includes(base);
          } catch (e) {
            return false;
          }
        });
      }
      p.cover = found || imgs[0] || '';
    } else {
      p.cover = imgs[0] || '';
    }
  }

  // convert to array and sort by year desc (if present)
  const projects = Object.values(projectsBySlug).sort((a, b) => {
    const ya = parseInt(a.year || 0, 10) || 0;
    const yb = parseInt(b.year || 0, 10) || 0;
    return yb - ya;
  });

  return projects;
}

export async function loadProjectBySlug(slug) {
  const projects = await loadProjects();
  return projects.find(p => p.slug === slug) || null;
}
