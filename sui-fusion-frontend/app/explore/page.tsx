import LiveStreamCard from '@/components/miscellaneous/live-stream-card'
import React from 'react'

const ExploreLivePage = () => {
    return (
        <div>
            <div className="px-8 py-8 flex flex-col gap-5">
                <h3 className="text-3xl font-bold">Currently Live</h3>
                <div className="flex flex-wrap gap-3">
                    {[{
                        name: "All", key: "all"
                    }].map((type) => (<button key={type.key} className="px-4 py-2 bg-muted/50 hover:bg-primary/30 text-muted-foreground hover:text-primary rounded-full text-xs font-medium transition-colors border border-border hover:border-primary/50">
                        {type.name}
                    </button>))}
                </div>
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
                    <LiveStreamCard
                        title="Maniac till morning"
                        channel="Bjørg emqxa"
                        category="Valorant"
                        viewers="345k"
                        thumbnail="/gaming-valorant-competitive.jpg"
                    />
                    <LiveStreamCard
                        title="Maniac till morning"
                        channel="Bjørg emqxa"
                        category="Valorant"
                        viewers="345k"
                        thumbnail="/gaming-valorant-competitive.jpg"
                    />
                    <LiveStreamCard
                        title="Maniac till morning"
                        channel="Bjørg emqxa"
                        category="Valorant"
                        viewers="345k"
                        thumbnail="/gaming-valorant-competitive.jpg"
                    />
                    <LiveStreamCard
                        title="Maniac till morning"
                        channel="Bjørg emqxa"
                        category="Valorant"
                        viewers="345k"
                        thumbnail="/gaming-valorant-competitive.jpg"
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
        </div>
    )
}

export default ExploreLivePage