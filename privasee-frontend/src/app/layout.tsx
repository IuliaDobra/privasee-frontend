import './globals.css';

export const metadata = {
    title: 'Next.js Table App',
    description: 'A sample Next.js app displaying a table with dynamic data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <main>{children}</main>
        </body>
        </html>
    );
}
