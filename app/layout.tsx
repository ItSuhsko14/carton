import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppFooter } from "@/components/AppFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carton.pp.ua";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Генератор протестних картонок",
    template: "%s · Генератор протестних картонок",
  },
  description:
    "Безкоштовний онлайн-генератор протестних плакатів і картонок. Оберіть шаблон, додайте свій напис і завантажте готове зображення для мітингу чи акції.",
  keywords: [
    "протестні картонки",
    "генератор плакатів",
    "протестні плакати",
    "картонка на мітинг",
    "створити плакат онлайн",
    "напис на картонці",
    "плакат для акції",
  ],
  applicationName: "Генератор протестних картонок",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: siteUrl,
    siteName: "Генератор протестних картонок",
    title: "Генератор протестних картонок",
    description:
      "Оберіть шаблон, додайте свій напис і завантажте готову протестну картонку — безкоштовно й без реєстрації.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Генератор протестних картонок",
    description:
      "Оберіть шаблон, додайте свій напис і завантажте готову протестну картонку — безкоштовно й без реєстрації.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Генератор протестних картонок",
              url: siteUrl,
              applicationCategory: "DesignApplication",
              operatingSystem: "Web",
              inLanguage: "uk",
              description:
                "Безкоштовний онлайн-генератор протестних плакатів і картонок з шаблонів.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "UAH",
              },
              mainEntity: {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "Як створити картонку онлайн безкоштовно?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Оберіть шаблон, додайте свій напис і завантажте готове зображення. Онлайн генератор картонок працює безкоштовно і без реєстрації.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Як зробити протестний плакат з текстом?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Виберіть шаблон плаката, введіть власне гасло, і генератор протестних плакатів створить картонку з текстом для мітингу чи акції.",
                    },
                  },
                  {
                    "@type": "Question",
                    name: "Чи потрібно встановлювати програму?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Ні, щоб зробити картонку, нічого встановлювати не треба — усе працює прямо у браузері на комп'ютері чи телефоні.",
                    },
                  },
                ],
              },
            }),
          }}
        />
        {children}
        <AppFooter />
        <Analytics />
      </body>
    </html>
  );
}
