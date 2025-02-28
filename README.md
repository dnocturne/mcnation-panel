# MCNation Panel

MCNation Panel is a comprehensive management system for Minecraft servers, featuring a built-in webstore, user management, and server administration tools.

## Features

- **Admin Dashboard**: Manage your Minecraft server from a central dashboard
- **Webstore**: Sell ranks, cosmetics, and gameplay items to your players
- **User Management**: Manage player accounts and permissions
- **Server Administration**: Control your Minecraft server directly from the panel

## Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MySQL

## Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL 8+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mcnation-panel.git
cd mcnation-panel
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
DATABASE_URL=mysql://username:password@localhost:3306/mcnation
NEXT_PUBLIC_API_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

4. Set up the database:
```bash
npm run db:setup
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Next.js app router
  - `admin/`: Admin dashboard pages
  - `store/`: User-facing store pages
  - `api/`: API routes
- `components/`: Reusable React components
- `lib/`: Utility functions and shared code
- `public/`: Static assets

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername) - email@example.com

Project Link: [https://github.com/yourusername/mcnation-panel](https://github.com/yourusername/mcnation-panel)
