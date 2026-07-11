import "./globals.css";

export const metadata = {
  title: "과제 관리 시스템",
  description: "운영자 · 매니저용 과제 관리 시스템",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
