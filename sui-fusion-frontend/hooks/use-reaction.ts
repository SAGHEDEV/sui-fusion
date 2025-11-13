import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Reaction {
    id: string;
    emoji: string;
    x: number;
}

// hooks/use-reaction.ts
export function useReactions(streamId: string) {
    const [reactions, setReactions] = useState<Reaction[]>([]);

    useEffect(() => {
        if (!streamId) return;

        const reactionsRef = collection(db, "streams", streamId, "reactions");
        const q = query(reactionsRef, orderBy("createdAt", "desc"), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    const newReaction: Reaction = {
                        id: change.doc.id,
                        emoji: data.emoji,
                        x: 50, // Always start from center (50%)
                    };

                    setReactions((prev) => [...prev, newReaction]);

                    setTimeout(() => {
                        setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
                    }, 3000);
                }
            });
        });

        return () => unsubscribe();
    }, [streamId]);

    const sendReaction = async (emoji: string) => {
        try {
            await addDoc(collection(db, "streams", streamId, "reactions"), {
                emoji,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error sending reaction:", error);
        }
    };

    return { reactions, sendReaction };
}