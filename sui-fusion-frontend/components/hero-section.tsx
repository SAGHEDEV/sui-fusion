import Image from "next/image";

const featuredStreamers = [
  { name: "Vortex", avatar: "/avatars/gamer1.jpg", game: "Valorant" },
  { name: "Nova", avatar: "/avatars/gamer2.avif", game: "PUBG" },
  { name: "Wexho", avatar: "/avatars/gamer3.jpg", game: "Mobile Legends" },
  { name: "Minexcraft", avatar: "/avatars/gamer4.jpg", game: "Minecraft" },
  { name: "Doxing Mama", avatar: "/avatars/gamer5.jpg", game: "Cooking Mama" },
  { name: "Fyre", avatar: "/avatars/gamer1.jpg", game: "Free Fire" },
  { name: "Axton", avatar: "/avatars/gamer5.jpg", game: "Assassin Creed" },
  { name: "Kendo", avatar: "/avatars/gamer3.jpg", game: "Tekken" },
  { name: "FrostBoi", avatar: "/avatars/gamer4.jpg", game: "Fortnite" },
];

export default function HeroSection() {
  return (
    <div className="relative w-full h-[400px] bg-linear-to-r from-primary/80 via-primary/40 to-background overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0">
        <img
          src="/valorant-game-character-red-dark.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-start px-12 pt-12 text-white">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold bg-primary/30 text-primary px-3 py-1 rounded-full border border-primary/50">
              Web3 Streamers
            </span>
            <span className="text-xs font-bold bg-secondary/20 text-secondary px-3 py-1 rounded-full border border-secondary/50">
              Live Now
            </span>
          </div>

          <h1 className="text-5xl font-black mb-2">
            “Battle of Realms” on Sui
          </h1>
          <h2 className="text-4xl font-black text-primary mb-6">Join the Hype!</h2>
          <p className="text-gray-300 text-sm mb-6">
            Compete with the best players worldwide. Watch top-tier gameplay and learn advanced tactics.
          </p>
        </div>

        {/* Featured Streamers */}
        <div className="w-full overflow-hidden mt-2">
          <div className="flex gap-4 min-w-full">
            {featuredStreamers.map((streamer, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 pr-4 py-1 min-w-28 rounded-full border border-gray-700 
                bg-[rgba(30,30,30,0.7)] hover:bg-[rgba(40,40,40,0.8)] 
                backdrop-blur-lg transition duration-300 cursor-pointer 
                shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:shadow-[0_0_15px_rgba(0,255,120,0.2)]"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-600">
                  <Image
                    src={streamer.avatar}
                    alt={streamer.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-semibold">{streamer.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
