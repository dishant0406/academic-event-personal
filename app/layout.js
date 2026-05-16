import "./globals.css";

export const metadata = {
  title: "CampusBuzz — Never Miss the Buzz",
  description: "The academic pulse of your campus. Discover seminars, workshops, conferences, guest lectures, and training programs across every department.",
  keywords: "campus events, university, seminars, workshops, conferences, BHU, IIT BHU",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
