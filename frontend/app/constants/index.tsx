import type { MenuItem } from "@/types";


/**
 * Assets
 */
import {
  ChartArea,
  Building2,
  Component,
  Code,
  BetweenHorizonalEnd,
  BrainCircuit,
  Blocks,
  Terminal,
  Package,
  SquareMousePointer,
  ChartPie,
  Files,
  UserRoundPen,
  GitFork,
  LaptopMinimal,
  ArrowBigDownDash,
  CreditCard,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Settings,
  Book,
  DollarSign,
  CalendarCheck,
  Users,
  Bell,
  BarChart3,
  FileText,
  MessageCircleQuestion,
  Scale,
} from 'lucide-react';

import {
  feature1,
  feature2,
  feature3,
  blog1,
  blog2,
  blog3,
  avatar1,
  avatar2,
  avatar3,
} from '@/assets';

// Header
export const navMenu: MenuItem[] = [
  {
    href: '/dashboard',
    label: 'Legal Tools',
    submenu: [
       {
        href: '/dashboard',
        icon: <Scale />,
        label: 'Case Dashboard',
        desc: 'Track, update, and manage all your legal cases in one place',
      },
      {
        href: '/dashboard',
        icon: <MessageCircleQuestion />,
        label: 'Ask AI Assistant',
        desc: 'Get instant legal answers, case summary, and draft generation',
      },
      {
        href: '/dashboard',
        icon: <FileText />,
        label: 'Document Vault',
        desc: 'Securely upload, store, and search case documents',
      },
      {
        href: '/dashboard',
        icon: <BarChart3 />,
        label: 'Analytics',
        desc: 'View firm- and personal-level analytics, deadlines, performance',
      },
      {
        href: '/dashboard',
        icon: <Bell />,
        label: 'Notifications',
        desc: 'Court dates, client updates, and AI–generated suggestions',
      },
      {
        href: '/dashboard',
        icon: <Users />,
        label: 'Clients',
        desc: 'Client management, intake, and secure communication',
      },
      {
        href: '/dashboard',
        icon: <CalendarCheck />,
        label: 'Calendar',
        desc: 'Track hearings, deadlines, meetings, and case milestones',
      },
   
      {
        href: '/dashboard',
        icon: <Book />,
        label: 'Resources',
        desc: 'Access legal guides, FAQs, policies, and knowledge base',
      },
     
    ],
  },
  {
    href: '/#features',
    label: 'Features',
  },
  {
    href:'/#cta',
    label:'Contact Us',
  }
//   {
//   href: '/docs',
//   label: 'Docs', // Could also use "Knowledge Base" or "Legal Library"
//   submenu: [
//     {
//       href: '/docs/getting-started',
//       icon: <Terminal />,
//       label: 'Getting Started',
//       desc: 'Quick setup, onboarding guide, and user basics for new lawyers and staff',
//     },
//     {
//       href: '/docs/core-concepts',
//       icon: <Package />,
//       label: 'Core Concepts',
//       desc: 'Platform structure, roles, and workflows for law firm management',
//     },
//     {
//       href: '/docs/customization',
//       icon: <SquareMousePointer />,
//       label: 'Customization',
//       desc: 'Personalize dashboard, AI prompts, and notification settings',
//     },
//     {
//       href: '/docs/integrations',
//       icon: <Blocks />,
//       label: 'Integrations',
//       desc: 'Connect with legal research, calendar, billing, and third-party apps',
//     },
//     {
//       href: '/docs/documentation',
//       icon: <FileText />,
//       label: 'Document Management',
//       desc: 'Secure storage, organization, search, and versioning for case files',
//     },
//     {
//       href: '/docs/faq',
//       icon: <MessageCircleQuestion />,
//       label: 'FAQs & Troubleshooting',
//       desc: 'Answers to common questions and solutions for platform issues',
//     },
//   ],
// },

  // {
  //   href: '/pricing',
  //   label: 'Pricing',
  // },
];

// Hero
export const heroData = {
  sectionSubtitle: 'Customize your All-In-One law firm toolkit',
  sectionTitle: 'Manage cases with next gen',
  decoTitle: 'AI assistance',
  sectionText:
    'Smarter legal case handling, instant answers, and progress insights. Built for the modern practice.',
};


// Feature
export const featureData = {
  sectionSubtitle: 'Features',
  sectionTitle: 'Discover Powerful Features',
  sectionText:
    'Explore smart tools built for modern law practices: from AI case bots to analytics and more.',
  features: [
    {
      icon: <ChartPie size={32} />,
      iconBoxColor: 'bg-blue-600',
      title: 'Advanced Analytics',
      desc: 'Visualize your milestones and case progress with intuitive charts and breakdowns.',
      imgSrc: feature1, // <-- Use your uploaded dashboard graph/chart image
    },
    {
      icon: <CalendarCheck size={32} />,
      iconBoxColor: 'bg-green-500',
      title: 'Event Management',
      desc: 'Schedule court dates, hearings, and send automated WhatsApp reminders to clients.',
      imgSrc: feature2, // <-- Use your event mgmt screenshot or illustration
    },
    {
      icon: <MessageCircleQuestion size={32} />,
      iconBoxColor: 'bg-purple-500',
      title: 'Case AI Chatbot',
      desc: 'Ask case-specific questions, get legal summaries, and draft responses instantly.',
      imgSrc:feature3,
      // (Optionally add conversation UI image/example)
    },
    {
      icon: <Files size={32} />,
      iconBoxColor: 'bg-cyan-500',
      title: 'Document Vault',
      desc: 'Upload and search files for each case securely and access them anywhere.',
      // imgSrc: ...
    },
  ],
};

// Process
export const processData = {
  sectionSubtitle: 'How it works',
  sectionTitle: 'Easy Process to Get Started',
  sectionText:
    'Get started in minutes: add your cases, ask AI for help, and manage events and hearings—all in one place.',
  list: [
    {
      icon: <LaptopMinimal size={32} />,
      title: 'Create your account',
      text: 'Sign up and unlock your secure workspace for managing all your legal work.',
    },
    {
      icon: <Files size={32} />,
      title: 'Add your first case',
      text: 'Quickly create and organize new legal matters, set priorities, and upload documents.',
    },
    {
      icon: <MessageCircleQuestion size={32} />,
      title: 'Get AI assistance',
      text: 'Ask questions, get legal summaries, and review suggested precedents for each case.',
    },
    {
      icon: <CalendarCheck size={32} />,
      title: 'Schedule events & reminders',
      text: 'Plan hearings, meetings, and send WhatsApp reminders directly from the platform.',
    },
  ],
};


// Overview
export const overviewData = {
  sectionSubtitle: 'Overview',
  sectionTitle: 'All-In-One Law Practice Platform',
  sectionText:
    'AI, analytics, and automation—everything lawyers need to deliver better results and work smarter.',
  listTitle: 'Trusted by thousands of legal professionals worldwide',
  list: [
    {
      title: '1,000+',
      text: 'Cases Managed',
    },
    {
      title: '4.9/5',
      text: 'User Satisfaction',
    },
    {
      title: '95%',
      text: 'AI Use Adoption',
    },
  ],
};


// Review
export const reviewData = {
  sectionSubtitle: 'Reviews',
  sectionTitle: 'What Our Customers Are Says',
  reviewCard: [
    {
      title: 'We’re building a better application now, thanks to ByteCraftLabs.',
      text: 'Our application is undergoing significant improvements with the help of NioLand, resulting in enhanced functionality, improved user experience',
      reviewAuthor: 'Amit Sharma',
      date: '3month ago',
    },
    {
      title: 'Great Service from a expert support system of ByteCraftLabs',
      text: 'Experience exceptional service and support from ByteCraftLabs expert team, dedicated to providing knowledgeable assistance and ensuring a seamless',
      reviewAuthor: 'Priya Nair',
      date: '2month ago',
    },
    {
      title: 'Pricing is amazing for the small businesses around the world',
      text: 'Our pricing is tailored to suit the needs of small businesses worldwide, offering affordable and competitive rates that provide excellent value for',
      reviewAuthor: 'Rahul Verma',
      date: '2month ago',
    },
  ],
};




// export const blogData = {
//   sectionSubtitle: 'Our Blog',
//   sectionTitle: 'Resource Center',
//   sectionText:
//     'Unlock the potential of our resource center, accessing valuable information and insights for your business growth.',
//   blogs: [
//     {
//       imgSrc: blog1,
//       badge: 'Growth',
//       title: 'Why customer retention is the ultimate growth strategy?',
//       author: {
//         avatarSrc: avatar1,
//         authorName: 'John Carte',
//         publishDate: 'Oct 10, 2024',
//         readingTime: '8 min read',
//       },
//     },
//     {
//       imgSrc: blog2,
//       badge: 'Marketing',
//       title: 'Optimizing your advertising campaigns for higher ROAS',
//       author: {
//         avatarSrc: avatar2,
//         authorName: 'Annette Black',
//         publishDate: 'Jul 15, 2024',
//         readingTime: '5 min read',
//       },
//     },
//     {
//       imgSrc: blog3,
//       badge: 'Growth',
//       title: 'How to build the ultimate tech stack for growth',
//       author: {
//         avatarSrc: avatar3,
//         authorName: 'Ralph Edwards',
//         publishDate: 'Mar 24, 2024',
//         readingTime: '2 min read',
//       },
//     },
//   ],
// };

// Cta
export const ctaData = {
  text: 'Start tracking your user analytics to boost your business growth',
};


// Footer
export const footerData = {
  links: [
    {
      title: 'Product',
      items: [
        {
          href: '#',
          label: 'Components',
        },
        {
          href: '#',
          label: 'Pricing',
        },
        {
          href: '#',
          label: 'Dashboard',
        },
        {
          href: '#',
          label: 'Feature requests',
        },
      ],
    },
    // {
    //   title: 'Developers',
    //   items: [
    //     {
    //       href: '#',
    //       label: 'Documentation',
    //     },
    //     {
    //       href: '#',
    //       label: 'Discord server',
    //     },
    //     {
    //       href: '#',
    //       label: 'Support',
    //     },
    //     {
    //       href: '#',
    //       label: 'Glossary',
    //     },
    //     {
    //       href: '#',
    //       label: 'Changelog',
    //     },
    //   ],
    // },
    {
      title: 'Company',
      items: [
        {
          href: '#',
          label: 'About',
        },
        {
          href: '#',
          label: 'Careers',
        },
        {
          href: '#',
          label: 'Blog',
        },
        {
          href: '#',
          label: 'Contact',
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          href: '#',
          label: 'Terms and Conditions',
        },
        {
          href: '#',
          label: 'Privacy Policy',
        },
        {
          href: '#',
          label: 'Data Processing Agreement',
        },
        {
          href: '#',
          label: 'Cookie manager',
        },
      ],
    },
  ],
  copyright: '© 2025 CustomLawFirm',
  socialLinks: [

    // {
    //   href: 'https://github.com/amaygit',
    //   icon: <Github size={18} />,
    // },
    {
      href: 'https://www.linkedin.com/company/byte-craft-lab/',
      icon: <Linkedin size={18} />,
    },
    {
      href: 'https://www.instagram.com/',
      icon: <Instagram size={18} />,
    },
    {
      href: 'https://www.youtube.com/',
      icon: <Youtube size={18} />,
    },
  ],
};
