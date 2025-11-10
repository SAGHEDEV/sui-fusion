import Sidebar from "@/components/sidebar"
import TopBar from "@/components/topbar"
import HeroSection from "@/components/hero-section"
import LiveStreamers from "@/components/live-streamers"
import RecommendationSection from "@/components/recommendation-section"
import GamesSection from "@/components/games-section"

export default function Home() {
  return (

    <div className="flex">
      {/* Hero Section with Live Streamers */}
      <div className="flex-1">
        <HeroSection />
        <RecommendationSection />
        <GamesSection />
      </div>
    </div>

  )
}
