// File: /pages/quest/unlock.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '../../lib/firebase';

export default function UnlockQuestPage() {
    const router = useRouter();
    const { id } = router.query; // This is the questId
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);
    const [message, setMessage] = useState('Verifying quest...');
    
    useEffect(() => {
        if (!id) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is logged in, process the quest
                setMessage('Unlocking quest...');
                try {
                    const questMasterRef = doc(db, 'quests_master', id);
                    const questMasterSnap = await getDoc(questMasterRef);

                    if (!questMasterSnap.exists()) {
                        setMessage('Error: This quest does not exist.');
                        return;
                    }
                    
                    const userQuestRef = doc(db, `user_quests/${user.uid}/quests`, id);
                    const userQuestSnap = await getDoc(userQuestRef);

                    if (userQuestSnap.exists()) {
                        setMessage('You have already unlocked this quest.');
                    } else {
                        await setDoc(userQuestRef, {
                            userId: user.uid,
                            questId: id,
                            status: 'unlocked',
                            unlockedAt: serverTimestamp(),
                        });
                        setMessage('Quest unlocked successfully! You can now complete it from your quests page.');
                    }
                    setTimeout(() => router.push('/quests'), 3000);

                } catch (error) {
                    console.error("Error unlocking quest:", error);
                    setMessage('An error occurred. Please try again.');
                }
            } else {
                // User is not logged in, redirect to login page
                // We save the intended URL to redirect back after login
                const redirectUrl = encodeURIComponent(`/quest/unlock?id=${id}`);
                router.push(`/?redirect_url=${redirectUrl}`);
            }
        });

        return () => unsubscribe();
    }, [id, auth, db, router]);
    
    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-purple-400">Quest Unlock</h1>
                <p className="text-xl mt-4">{message}</p>
            </div>
        </div>
    );
}