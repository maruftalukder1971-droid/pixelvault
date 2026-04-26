import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl font-semibold tracking-tight mb-2">404</div>
      <p className="text-zinc-500 mb-6">This wallpaper drifted into the void.</p>
      <Link href="/" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition">Back home</Link>
    </div>
  );
}