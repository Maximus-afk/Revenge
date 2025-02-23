import "./globals.css";
import { GamePerspectiveProvider } from '@/lib/game/GamePerspectiveContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GamePerspectiveProvider>
          {children}
        </GamePerspectiveProvider>
      </body>
    </html>
  );
}
