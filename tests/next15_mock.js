// Mock Next.js 15 App Router dynamic route handler accessing params synchronously
export default function BlogPost({ params }) {
    const { slug } = params; // This synchronous access breaks in Next.js 15!
    return <div>{slug}</div>;
}
