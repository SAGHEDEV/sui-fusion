import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { doc, setDoc, deleteDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useViewerCount(streamId: string) {
    const [viewerCount, setViewerCount] = useState(0);
    const currentAccount = useCurrentAccount();
    const userId = currentAccount?.address || `guest_${Math.random().toString(36).substring(7)}`;

    useEffect(() => {
        if (!streamId) return;

        const viewerRef = doc(db, "streams", streamId, "viewers", userId);

        // Add current user as viewer
        const addViewer = async () => {
            try {
                await setDoc(viewerRef, {
                    joinedAt: serverTimestamp(),
                    lastSeen: serverTimestamp(),
                });
            } catch (error) {
                console.error("Error adding viewer:", error);
            }
        };

        addViewer();

        // Update lastSeen every 30 seconds to show active viewers
        const interval = setInterval(() => {
            setDoc(viewerRef, {
                lastSeen: serverTimestamp(),
            }, { merge: true });
        }, 30000);

        // Listen to viewer count changes in real-time
        const viewersCollectionRef = collection(db, "streams", streamId, "viewers");
        const unsubscribe = onSnapshot(viewersCollectionRef, (snapshot) => {
            // Filter out stale viewers (inactive for > 1 minute)
            const now = Date.now();
            const activeViewers = snapshot.docs.filter(doc => {
                const lastSeen = doc.data().lastSeen?.toMillis() || 0;
                return now - lastSeen < 60000; // 1 minute threshold
            });
            setViewerCount(activeViewers.length);
        });

        // Cleanup: Remove viewer when leaving
        return () => {
            clearInterval(interval);
            unsubscribe();
            deleteDoc(viewerRef).catch(console.error);
        };
    }, [streamId, userId]);

    return viewerCount;
}