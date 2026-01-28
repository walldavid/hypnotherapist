const mongoose = require('mongoose');
const Page = require('../models/Page');
require('dotenv').config();

const hypnosisHelpPage = {
  slug: 'how-can-hypnosis-help',
  title: 'How Can Hypnosis Help?',
  metaDescription: 'Discover how hypnotherapy can help with stress, anxiety, sleep, confidence, and more. Learn about the benefits of professional hypnosis.',
  status: 'published',
  sections: [
    {
      id: 'intro-heading',
      type: 'heading',
      content: 'The Power of Hypnotherapy',
      order: 1
    },
    {
      id: 'intro-para',
      type: 'paragraph',
      content: 'Hypnotherapy is a powerful therapeutic technique that helps you access your subconscious mind to create positive change. Through guided relaxation and focused attention, hypnosis can help you overcome challenges, break unwanted habits, and achieve your personal goals.',
      order: 2
    },
    {
      id: 'what-is-heading',
      type: 'heading',
      content: 'What is Hypnosis?',
      order: 3
    },
    {
      id: 'what-is-para',
      type: 'paragraph',
      content: 'Hypnosis is a natural state of focused concentration and heightened suggestibility. It\'s similar to the feeling you have when you\'re deeply absorbed in a book or movie. During hypnosis, you remain fully in control while your subconscious mind becomes more receptive to positive suggestions and change.',
      order: 4
    },
    {
      id: 'benefits-heading',
      type: 'heading',
      content: 'What Can Hypnotherapy Help With?',
      order: 5
    },
    {
      id: 'benefits-list',
      type: 'list',
      content: 'Stress and Anxiety Relief|Improved Sleep Quality|Breaking Bad Habits (smoking, nail biting)|Weight Management|Confidence and Self-Esteem|Pain Management|Overcoming Phobias|Performance Enhancement|Relaxation and Mindfulness',
      order: 6
    },
    {
      id: 'how-works-heading',
      type: 'heading',
      content: 'How Does It Work?',
      order: 7
    },
    {
      id: 'how-works-para',
      type: 'paragraph',
      content: 'Our digital hypnotherapy programs use professionally recorded audio sessions to guide you into a relaxed, focused state. Through carefully crafted suggestions and imagery, these programs help reprogram negative thought patterns and behaviors. Regular listening reinforces positive changes, helping you achieve lasting results.',
      order: 8
    },
    {
      id: 'safety-heading',
      type: 'heading',
      content: 'Is Hypnosis Safe?',
      order: 9
    },
    {
      id: 'safety-para',
      type: 'paragraph',
      content: 'Yes, hypnotherapy is completely safe. You remain fully aware and in control throughout the session. You cannot be made to do anything against your will. Hypnosis is simply a tool to help you access your own inner resources for positive change. All our programs are created by certified, experienced hypnotherapists.',
      order: 10
    },
    {
      id: 'getting-started-heading',
      type: 'heading',
      content: 'Getting Started',
      order: 11
    },
    {
      id: 'getting-started-para',
      type: 'paragraph',
      content: 'Browse our collection of professional hypnotherapy programs and choose the one that fits your needs. Each program is available for instant download, so you can start your journey to positive change today. Listen in a quiet, comfortable space where you won\'t be disturbed, and allow yourself to fully relax and engage with the process.',
      order: 12
    }
  ]
};

async function seedPage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hypnotherapist');
    console.log('Connected to MongoDB');

    // Check if page already exists
    const existing = await Page.findOne({ slug: 'how-can-hypnosis-help' });
    
    if (existing) {
      console.log('Page already exists. Updating...');
      await Page.findOneAndUpdate(
        { slug: 'how-can-hypnosis-help' },
        hypnosisHelpPage,
        { new: true }
      );
      console.log('✅ Page updated successfully');
    } else {
      await Page.create(hypnosisHelpPage);
      console.log('✅ Page created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding page:', error);
    process.exit(1);
  }
}

seedPage();
