import './global.css';

export const metadata = {
  title: 'Booking Search',
  description: 'Explore fake hotel search results in a polished booking UI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
