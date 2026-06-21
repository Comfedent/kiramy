import "./globals.css";

export const metadata = {
  title: "Kira Malaysia 2.0 - Personal Finance Decision Engine",
  description: "A Malaysian personal finance decision engine for affordability, bank comparison, and scenario simulation."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
