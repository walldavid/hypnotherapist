const Page = require('../models/Page');

// Get page by slug (public)
exports.getPageBySlug = async (req, res, next) => {
  try {
    const page = await Page.findOne({ 
      slug: req.params.slug,
      status: 'published'
    });

    if (!page) {
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
    const pages = await Page.find({ status: 'published' })
      .select('slug title metaDescription')
      .sort('title');

    res.json({ pages });
  } catch (error) {
    next(error);
  }
};

// Create page (admin only)
exports.createPage = async (req, res, next) => {
  try {
    const page = new Page({
      ...req.body,
      modifiedBy: req.admin._id
    });
    
    await page.save();
    res.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

// Update page (admin only)
exports.updatePage = async (req, res, next) => {
  try {
    const page = await Page.findOneAndUpdate(
      { slug: req.params.slug },
      { 
        ...req.body,
        modifiedBy: req.admin._id,
        lastModified: Date.now()
      },
      { new: true, runValidators: true }
    );

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

    const page = await Page.findOne({ slug });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const section = page.sections.find(s => s.id === sectionId);
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    section.content = content;
    page.modifiedBy = req.admin._id;
    page.lastModified = Date.now();

    await page.save();

    res.json(page);
  } catch (error) {
    next(error);
  }
};

// Delete page (admin only)
exports.deletePage = async (req, res, next) => {
  try {
    const page = await Page.findOneAndDelete({ slug: req.params.slug });

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};
