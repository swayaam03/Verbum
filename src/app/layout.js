import "./globals.css";

export const metadata = {
  title: "Verbum - Where words find meaning",
  description: "A sanctuary for authentic voices, where every sentence is crafted with intention and every story finds its resonance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
