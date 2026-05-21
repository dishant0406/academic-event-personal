import "./globals.css";

export const metadata = {
  title: "Academic Events Hub (AEH) — Never miss a relevant academic opportunity again",
  description: "The academic pulse of Banaras Hindu University. Discover seminars, workshops, conferences, guest lectures, and training programs across 100+ departments for 30,000+ students.",
  keywords: "academic events, AEH, BHU, Banaras Hindu University, seminars, workshops, conferences",
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
