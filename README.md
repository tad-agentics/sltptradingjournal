# SLTP Trading Journal

A modern, beautiful trading journal app for tracking your trades with real-time cloud sync.

## Features

- 📊 **Portfolio Summary** - Track your overall trading performance
- 📅 **Trade Calendar** - Visual calendar view of your trading activity
- 📝 **Trade Details** - Detailed view of each trade with P&L, fees, and notes
- ⚙️ **Customizable Settings** - Configure balance, targets, and trading pairs
- 🌓 **Dark/Light Theme** - Choose your preferred theme
- ☁️ **Cloud Sync** - Sync your trades across all devices with Supabase
- 💾 **Offline Support** - Falls back to localStorage when offline

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Lightning fast build tool
- **Tailwind CSS 4.0** - Modern styling
- **Radix UI** - Accessible component primitives
- **Supabase** - Cloud database and real-time sync
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/tad-agentics/sltptradingjournal.git
cd sltptradingjournal
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open http://localhost:5173/ in your browser

### Cloud Storage Setup (Optional)

To enable cloud sync across devices:

1. Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. Create a free Supabase account
3. Set up your database
4. Add environment variables

**Note**: The app works perfectly fine with just localStorage if you don't need cloud sync!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
sltptradingjournal/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── AddTradeDialog.tsx
│   ├── DailyTradeDetail.tsx
│   ├── PortfolioSummary.tsx
│   ├── SettingsDialog.tsx
│   └── TradeCalendar.tsx
├── lib/                # Utility functions and services
│   ├── supabase.ts     # Supabase client configuration
│   └── tradeService.ts # Trade data service layer
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── globals.css         # Global styles
```

## Deployment

This app is deployed on Vercel at: [https://sltptradingjournal.vercel.app/](https://sltptradingjournal.vercel.app/)

To deploy your own instance:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables (if using Supabase)
4. Deploy!

## Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for setup help
- Open an issue on GitHub
- Check browser console for error messages

---

Built with ❤️ for traders who want to track their performance
