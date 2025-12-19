## Packages
framer-motion | Complex animations for page transitions and interactions
lucide-react | Icons for the UI
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes
react-hook-form | Form state management
@hookform/resolvers | Validation resolvers for react-hook-form
zod | Schema validation
wouter | Routing
@tanstack/react-query | Data fetching
recharts | Dashboard analytics charts

## Notes
- Tailwind Config needs to extend fontFamily for 'display' and 'body'.
- Auth flow uses cookie-based sessions (credentials: "include").
- Images are handled via URL strings (jsonb column in DB), using Unsplash as fallback.
- Wouter <Link> components render as <a> tags, do not nest <a> inside <Link>.
