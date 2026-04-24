import './globals.css';

export const metadata = {
  title: 'AI Product Scout',
  description: 'AI-powered product intelligence dashboard'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
