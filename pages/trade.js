// File: /pages/trade.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from '../lib/firebase';
// NOTE: You would need to implement the actual backend logic in Firebase Cloud Functions
// import { transferCard } from '../lib/api'; 

export default function TradePage() {
    const [user, setUser] = useState(null);
    const [userCards, setUserCards] = useState({});
    const [masterCards, setMasterCards] = useState({});
    const [selectedCardId, setSelectedCardId] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [message, setMessage] = useState('');
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) setUser(currentUser);
            else router.push('/');
        });

        const fetchMasterCards = async () => {
            const querySnapshot = await getDocs(collection(db, "cards_master"));
            const cards = {};
            querySnapshot.forEach(doc => cards[doc.id] = doc.data());
            setMasterCards(cards);
        };
        fetchMasterCards();
    }, []);

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, "user_cards", user.uid), (doc) => {
            if (doc.exists()) {
                setUserCards(doc.data().collection || {});
            }
        });
        return () => unsub();
    }, [user]);

    const handleTrade = async (e) => {
        e.preventDefault();
        if (!selectedCardId || !recipientId) {
            setMessage('Please select a card and enter a recipient ID.');
            return;
        }
        setMessage('Processing trade...');
        
        // In a real app, this calls a backend function:
        // const result = await transferCard({ cardId: selectedCardId, recipientId: recipientId });
        // if (result.success) {
        //     setMessage('Trade successful!');
        //     setSelectedCardId('');
        //     setRecipientId('');
        // } else {
        //     setMessage(`Trade failed: ${result.error}`);
        // }
        
        // Mock success for demonstration
        setTimeout(() => {
            setMessage('Trade successful! (This is a demo)');
        }, 1500);
    };

    const ownedCards = Object.keys(userCards).filter(cardId => userCards[cardId] > 0);

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-purple-400 mb-6">Trade Cards</h1>
            <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
                <form onSubmit={handleTrade}>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2" htmlFor="card-select">Card to Send</label>
                        <select
                            id="card-select"
                            value={selectedCardId}
                            onChange={(e) => setSelectedCardId(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        >
                            <option value="">-- Select a Card --</option>
                            {ownedCards.map(cardId => (
                                <option key={cardId} value={cardId}>
                                    {masterCards[cardId]?.name} (x{userCards[cardId]})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2" htmlFor="recipient-id">Recipient's User ID</label>
                        <input
                            type="text"
                            id="recipient-id"
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg font-mono"
                            placeholder="Enter the other player's User ID"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
                    >
                        Send Card
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-yellow-300">{message}</p>}
            </div>
        </Layout>
    );
}