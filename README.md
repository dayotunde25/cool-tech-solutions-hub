# Technical Services Company Website

A modern, responsive website for a technical services company offering AC repair, refrigeration, solar panel installation, and electrical services.

## 🚀 Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui, Radix UI primitives
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner (toast notifications)

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── Header.tsx       # Navigation header
│   ├── Hero.tsx         # Hero section
│   ├── Services.tsx     # Services showcase
│   ├── About.tsx        # About section
│   ├── News.tsx         # Industry news (automated)
│   ├── Feedback.tsx     # Customer testimonials
│   ├── Contact.tsx      # Contact form
│   └── Footer.tsx       # Footer with social links
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── assets/              # Static assets and images
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd <project-name>

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Hosting Options

### Recommended: Lovable Platform
- **One-click deployment** through Lovable interface
- **Custom domain support** (paid plans)
- **Automatic HTTPS** and global CDN
- **Built-in analytics** and performance monitoring

### Alternative Hosting Platforms
- **Vercel**: `npm run build` → Connect GitHub repo
- **Netlify**: `npm run build` → Drag & drop `dist` folder
- **GitHub Pages**: Enable in repository settings
- **Firebase Hosting**: `firebase init` → `firebase deploy`

## 💾 Database Requirements

### For Basic Website (Current)
- **No database required** - Static content only
- All content is hardcoded in components

### For Admin Features (Recommended)
Connect to **Supabase** for:

#### Database Tables Needed:
```sql
-- Posts/Media management
posts (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP,
  published BOOLEAN
);

-- Media files
media (
  id UUID PRIMARY KEY,
  filename TEXT,
  url TEXT,
  type TEXT,
  size INTEGER,
  uploaded_at TIMESTAMP
);

-- Contact form submissions
contacts (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP
);
```

#### Required Supabase Features:
- **Authentication**: Admin login system
- **Database**: PostgreSQL for content storage
- **Storage**: File uploads for images/media
- **Row Level Security**: Protect admin content
- **Edge Functions**: API endpoints for forms

## 🔧 Configuration

### Environment Variables
```env
# For News API (optional)
VITE_NEWS_API_KEY=your_newsapi_key

# For Supabase (when connected)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Design System
- Custom design tokens in `src/index.css`
- Tailwind configuration in `tailwind.config.ts`
- HSL color system for theme consistency

## 📱 Features

### Current Features
- ✅ Responsive design (mobile-first)
- ✅ Contact form with validation
- ✅ Automated industry news feed
- ✅ Social media integration
- ✅ Service showcase with images
- ✅ Customer testimonials
- ✅ WhatsApp direct messaging

### Planned Features (Requires Supabase)
- 🔄 Admin dashboard for content management
- 🔄 Media upload system
- 🔄 Dynamic posts/portfolio
- 🔄 Contact form submissions storage
- 🔄 User authentication
- 🔄 Analytics dashboard

## 🚀 Deployment Steps

1. **Connect to GitHub** (if using external hosting)
2. **Build the project**: `npm run build`
3. **Choose hosting platform**:
   - **Lovable**: Click "Publish" button
   - **Vercel**: Connect GitHub repository
   - **Netlify**: Upload `dist` folder
4. **Configure custom domain** (optional)
5. **Set up environment variables** on hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and commit: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For technical support or feature requests:
- **WhatsApp**: [Contact via WhatsApp]
- **Email**: contact@yourcompany.com
- **Website**: Visit contact section

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using [Lovable](https://lovable.dev)