import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">Sprint Review App</h1>
      <div className="flex gap-4">
        <a
          href="/auth/signin"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Sign In
        </a>
        <a
          href="/auth/signup"
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
          Sign Up
        </a>
      </div>
    </div>
  );
}
