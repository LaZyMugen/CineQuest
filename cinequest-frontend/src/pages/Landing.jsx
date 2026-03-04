import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function Landing() {
  const [imageHidden, setImageHidden] = useState(false);

  return (
    <main className="min-h-screen w-screen overflow-x-hidden bg-black text-gray-200">
      <div
        className="relative flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 text-center"
        style={{
          backgroundImage: "url('/backCover.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/60" aria-hidden />
        <div className="relative z-10 flex w-full flex-col items-center">
        {!imageHidden && (
          <img
            src="/landing-photo.png"
            alt="CineQuest"
            className="mb-8 w-full max-w-md object-contain"
            onError={() => setImageHidden(true)}
          />
        )}

        <Button as={Link} to="/login" className="mt-2 px-8 py-3 text-base">
          Browse Movies
        </Button>

        <section className="mt-12 w-full max-w-2xl rounded-lg border border-border bg-transparent p-6 text-left backdrop-blur-[1px]">
          <h2 className="text-lg font-semibold text-gray-100">Features</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>• Real-time seat booking</li>
            <li>• Live lock and expiry handling</li>
            <li>• Quick booking confirmation flow</li>
            <li>• Personal booking history</li>
            <li>• Admin movie and show management</li>
          </ul>
        </section>
        </div>
      </div>
    </main>
  );
}
