// app/layout.js
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'TravAI - AI-Powered Travel Planner',
  description: 'Plan your perfect trip with AI assistance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}