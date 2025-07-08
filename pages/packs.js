// File: /pages/packs.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
// NOTE: You would need to implement the actual backend logic in Firebase Cloud Functions
// import { openBoosterPack } from '../lib/api';

const packDetails = {
    BP1: { name: 'Tier 1 Booster Pack', color: 'bg-blue-600' },
    BP2: { name: 'Tier 2 Booster Pack', color: 'bg-green-600' },
    BP3: { name: 'Tier 3 Booster Pack', color: 'bg-yellow-500' },
};

export default function PacksPage() {
    const [user, setUser] = useState(null);
    const [packs, setPacks] = useState({});
    const [revealedCards, setRevealedCards] = useState([]);
    const [isOpening, setIsOpening] = useState(false);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const unsubDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        setPacks(doc.data().boosterPacks || {});
                    }
                });
                return () => unsubDoc();
            } else {
                router.push('/');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleOpenPack = async (packTier) => {
        if (isOpening || !packs[packTier] || packs[packTier] <= 0) return;
        setIsOpening(true);
        
        // In a real app, this calls a backend function:
        // const result = await openBoosterPack({ packTier });
        // For demonstration, we'll use mock data.
        // playSound('pack-open');
        const mockCards = [
            { id: 'c1', name: 'Mock Card A', rarity: 'Common', isNew: true },
            { id: 'c2', name: 'Mock Card B', rarity: 'Rare', isNew: false },
            { id: 'c3', name: 'Mock Card C', rarity: 'Common', isNew: true },
        ];
        
        // Simulate revealing cards one by one
        for (let i = 0; i < mockCards.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1200));
            setRevealedCards(prev => [...prev, mockCards[i]]);
            // playSound(mockCards[i].rarity === 'Rare' ? 'reveal-rare' : 'reveal-common');
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before closing modal
        
        setIsOpening(false);
        setRevealedCards([]);
    };

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-purple-400 mb-6">Booster Packs</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(packDetails).map(([tier, details]) => (
                    <div key={tier} className={`p-6 rounded-lg shadow-lg text-center ${details.color}`}>
                        <h2 className="text-2xl font-bold">{details.name}</h2>
                        <p className="text-5xl font-mono font-bold my-4">{packs[tier] || 0}</p>
                        <button
                            onClick={() => handleOpenPack(tier)}
                            disabled={!packs[tier] || packs[tier] <= 0 || isOpening}
                            className="w-full bg-white text-black font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isOpening ? 'Opening...' : 'Open'}
                        </button>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isOpening && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    >
                        <div className="flex space-x-4">
                            {revealedCards.map((card, index) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, y: 50, rotateY: 180 }}
                                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                                    transition={{ duration: 0.8, delay: index * 0.2 }}
                                    className={`relative w-48 h-64 rounded-xl shadow-2xl ${card.rarity === 'Rare' ? 'bg-yellow-400' : 'bg-gray-400'} p-2`}
                                >
                                    <div className="w-full h-full bg-gray-800 rounded-lg flex flex-col justify-center items-center p-2 text-white">
                                        {card.isNew && <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">NEW!</span>}
                                        <h3 className="text-lg font-bold">{card.name}</h3>
                                        <p className="text-sm">{card.rarity}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
}