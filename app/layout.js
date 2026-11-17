import "./globals.css";

export const metadata = {
  title: "AI-повар — что приготовить?",
  description: "Отметь продукты, которые есть дома, и получи 3 рецепта за 10 секунд.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
