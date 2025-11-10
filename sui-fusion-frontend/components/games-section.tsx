"use client"

const GameCard = ({ title, image, fps, category }: { title: string; image: string; fps: string; category: string }) => (
  <div className="bg-card rounded-lg overflow-hidden hover:border-primary/50 border border-border transition-all cursor-pointer group">
    <div className="relative h-48 overflow-hidden bg-black">
      <img
        src={image || "/placeholder.svg"}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <button className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded font-bold text-sm transition-colors">
          Get Game
        </button>
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-bold text-sm mb-2">{title}</h4>
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{fps}</p>
        <p className="text-xs text-muted-foreground">{category}</p>
      </div>
    </div>
  </div>
)

const GameCategory = ({ name }: { name: string }) => (
  <button className="px-4 py-2 bg-muted/50 hover:bg-primary/30 text-muted-foreground hover:text-primary rounded-full text-xs font-medium transition-colors border border-border hover:border-primary/50">
    {name}
  </button>
)

export default function GamesSection() {
  const games = [
    { title: "Valorant", image: "/valorant-cover.png", fps: "FPS", category: "Shooter" },
    { title: "PUBG", image: "/pubg-game-cover.jpg", fps: "FPS", category: "Shooter" },
    { title: "The Sims", image: "/the-sims-game.jpg", fps: "FPS", category: "Simulation" },
    { title: "Minecraft", image: "/minecraft-game.png", fps: "FPS", category: "Sandbox" },
    { title: "Fortnite", image: "/generic-battle-royale-cover.png", fps: "FPS", category: "Shooter" },
    { title: "GTA V", image: "/gta-5-game-cover.jpg", fps: "FPS", category: "Adventure" },
  ]

  return (
    <div className="px-8 py-8">
      <h3 className="text-2xl font-bold mb-6">The games we think you'll like</h3>
      <div className="flex flex-wrap gap-3 pb-12">
        <GameCategory name="Racer" />
        <GameCategory name="Adventure" />
        <GameCategory name="Puzzle" />
        <GameCategory name="RPG" />
        <GameCategory name="MMORPG" />
        <GameCategory name="Roleplay" />
        <GameCategory name="Mmorpg" />
        <GameCategory name="Balls" />
        <GameCategory name="Simulation" />
        <GameCategory name="Gaming" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-12">
        {games.map((game, idx) => (
          <GameCard key={idx} {...game} />
        ))}
      </div>

      {/* <h3 className="text-2xl font-bold mb-6">The games we think you'll like</h3> */}
    </div>
  )
}
