// File: /components/CardAlbum.js
import { useEffect, useState } from 'react';
import { getFirestore, doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../lib/firebase';
import { motion } from 'framer-motion';

const Card = ({ card, count }) => (
    <motion.div 
        className="relative aspect-[2.5/3.5] bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-gray-700"
        whileHover={{ scale: 1.05, zIndex: 10 }}
        transition={{ duration: 0.2 }}
    >
        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-60">
            <h3 className="text-white font-bold text-sm truncate">{card.name}</h3>
            <p className={`text-xs font-semibold ${card.rarity === 'Rare' ? 'text-yellow-400' : 'text-gray-300'}`}>{card.rarity}</p>
        </div>
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            x{count}
        </div>
    </motion.div>
);

const PlaceholderCard = () => (
    <div className="aspect-[2.5/3.5] bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
        <p className="text-gray-500 text-3xl font-bold">?</p>
    </div>
);


export default function CardAlbum({ userId }) {
    const [masterCards, setMasterCards] = useState([]);
    const [userCards, setUserCards] = useState({});
    const [loading, setLoading] = useState(true);
    const db = getFirestore(firebaseApp);

    useEffect(() => {
        const fetchMasterCards = async () => {
            const querySnapshot = await getDocs(collection(db, "cards_master"));
            const cards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by album and name
            cards.sort((a, b) => {
                if (a.albumId < b.albumId) return -1;
                if (a.albumId > b.albumId) return 1;
                return a.name.localeCompare(b.name);
            });
            setMasterCards(cards);
        };
        fetchMasterCards();
    }, [db]);

    useEffect(() => {
        if (!userId) return;
        const unsub = onSnapshot(doc(db, "user_cards", userId), (doc) => {
            if (doc.exists()) {
                setUserCards(doc.data().collection || {});
            }
            setLoading(false);
        });
        return () => unsub();
    }, [userId, db]);

    const albums = masterCards.reduce((acc, card) => {
        (acc[card.albumId] = acc[card.albumId] || []).push(card);
        return acc;
    }, {});

    if (loading) {
        return <div className="text-center text-xl mt-10">Loading Card Album...</div>;
    }

    return (
        <div className="mt-10">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-300">My Card Album</h2>
            {Object.keys(albums).sort().map(albumId => (
                <div key={albumId} className="mb-12">
                    <h3 className="text-2xl font-semibold mb-4 text-purple-300 border-b-2 border-purple-500 pb-2">
                        {albumId} ({Object.values(albums[albumId]).filter(card => userCards[card.id] > 0).length}/{albums[albumId].length})
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
                        {albums[albumId].map(card => (
                            userCards[card.id] > 0 ? (
                                <Card key={card.id} card={card} count={userCards[card.id]} />
                            ) : (
                                <PlaceholderCard key={card.id} />
                            )
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}