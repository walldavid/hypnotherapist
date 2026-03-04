const pages = require('../collections/pages');

// Get page by slug (public)
exports.getPageBySlug = async (req, res, next) => {
  try {
    const page = await pages.getBySlug(req.params.slug);
    if (!page || page.status !== 'published') {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    next(error);
  }
};

// Get all pages (public - just metadata)
exports.getAllPages = async (req, res, next) => {
  try {
    const all = await pages.list('published');
    res.json({ pages: all.map(({ sections, ...meta }) => meta) });
  } catch (error) {
    next(error);
  }
};

// Create page (admin only)
exports.createPage = async (req, res, next) => {
  try {
    const page = await pages.create(req.body, req.admin.id);
    res.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

// Update page (admin only)
exports.updatePage = async (req, res, next) => {
  try {
    const page = await pages.update(req.params.slug, req.body, req.admin.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    next(error);
  }
};

// Update specific section (admin only)
exports.updateSection = async (req, res, next) => {
  try {
    const { slug, sectionId } = req.params;
    const { content } = req.body;
    const page = await pages.updateSection(slug, sectionId, content, req.admin.id);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    next(error);
  }
};

// Delete page (admin only)
exports.deletePage = async (req, res, next) => {
  try {
    const page = await pages.getBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }
    await pages.remove(req.params.slug);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};
