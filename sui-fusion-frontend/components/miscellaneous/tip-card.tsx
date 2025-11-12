import { useProfile } from '@/hooks/use-profile'
import { formatDistanceToNowStrict } from 'date-fns'
import React from 'react'

const TipCard = ({ tip }: { tip: any }) => {
    const {profileData, isCheckingProfile} = useProfile({address: tip.fields.sender})
    return (
        <div
            className="w-full flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 hover:bg-gray-900/80 transition"
        >
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {isCheckingProfile ? "?" : profileData?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                    <p className="text-sm text-white font-medium">
                        <span className="truncate">
                            {isCheckingProfile ? "Loading.." :profileData?.name || "Anonymous"}{" "}
                        </span>
                        <span className="text-gray-400 text-xs">
                            tipped you
                        </span>
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatDistanceToNowStrict(new Date(parseInt(tip.fields.time)), { addSuffix: true })}
                    </p>
                </div>
            </div>
            <span className="text-sui-blue font-semibold">
                {tip.fields.amount / 1_000_000_000} SUI
            </span>
        </div>
    )
}

export default TipCard