"use client";

export default function AuthGate() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow text-center w-80">
        <h2 className="text-lg font-semibold mb-2">
          Login Required
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Connect your YouTube account to continue
        </p>

        <a
          href="/api/auth/start"
          className="block w-full bg-black text-white py-2 rounded"
        >
          Login with Google
        </a>
      </div>
    </div>
  );
}