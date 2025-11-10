"use client"

import LiveStreamCard from "./miscellaneous/live-stream-card"

export default function RecommendationSection() {
  return (
    <div className="px-8 py-8">
      <h3 className="text-2xl font-bold mb-6">Recommendation live video</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LiveStreamCard
          title="Headshot till morning if don't will weewonwsfw"
          channel="Bjørg emqxa"
          category="Valorant"
          viewers="234k"
          thumbnail="/gaming-stream-valorant-highlight.jpg"
        />
        <LiveStreamCard
          title="Sentinals vs C9 Epic Match | Americas Last Chance Quali..."
          channel="Bjørg emqxa"
          category="Valorant"
          viewers="567k"
          thumbnail="/esports-tournament-valorant-match.jpg"
        />
        <LiveStreamCard
          title="Maniac till morning"
          channel="Bjørg emqxa"
          category="Valorant"
          viewers="345k"
          thumbnail="/gaming-valorant-competitive.jpg"
        />
      </div>
    </div>
  )
}
