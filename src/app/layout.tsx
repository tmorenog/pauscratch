import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pau's Worldcup Bracket",
  description:
    "An interactive World Cup knockout bracket — pick match results and advance teams all the way to the final.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Prevent dark-mode flash on first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('paus-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
