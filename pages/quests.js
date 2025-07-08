// File: /pages/quests.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '../lib/firebase';
// NOTE: You would need to implement the actual backend logic in Firebase Cloud Functions
// import { completeQuest, submitP2PQuest } from '../lib/api'; 

export default function QuestsPage() {
    const [user, setUser] = useState(null);
    const [quests, setQuests] = useState([]);
    const [userQuests, setUserQuests] = useState({});
    const [loading, setLoading] = useState(true);
    const auth = getAuth(firebaseApp);
    const db = getFirestore(firebaseApp);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // Redirect to login if not authenticated
                router.push('/');
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Fetch all master quests
        const fetchMasterQuests = async () => {
            const querySnapshot = await getDocs(collection(db, "quests_master"));
            const masterQuests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuests(masterQuests);
        };

        fetchMasterQuests();
    }, [db]);

    useEffect(() => {
        if (!user) return;
        
        // Listen for real-time updates on user's quest progress
        const userQuestsCollectionRef = collection(db, `user_quests/${user.uid}/quests`);
        const unsub = onSnapshot(userQuestsCollectionRef, (querySnapshot) => {
            const uQuests = {};
            querySnapshot.forEach((doc) => {
                uQuests[doc.id] = doc.data();
            });
            setUserQuests(uQuests);
            setLoading(false);
        });

        return () => unsub();
    }, [user, db]);

    const getQuestStatus = (questId) => {
        const userQuest = userQuests[questId];
        if (!userQuest) return "Locked";
        return userQuest.status.charAt(0).toUpperCase() + userQuest.status.slice(1); // Capitalize
    };

    if (loading) {
        return <Layout><div className="text-center">Loading quests...</div></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-purple-400 mb-6">Available Quests</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quests.map(quest => (
                    <div key={quest.id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-start">
                            <h2 className="text-xl font-bold text-white">{quest.name}</h2>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                getQuestStatus(quest.id) === 'Completed' ? 'bg-green-500 text-white' :
                                getQuestStatus(quest.id) === 'Unlocked' ? 'bg-blue-500 text-white' :
                                getQuestStatus(quest.id) === 'Pending_approval' ? 'bg-yellow-500 text-black' :
                                'bg-gray-600 text-gray-300'
                            }`}>
                                {getQuestStatus(quest.id).replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-gray-400 mt-2">{quest.description}</p>
                        <div className="mt-4">
                            <p className="font-semibold text-gray-300">Reward:</p>
                            <p className="text-purple-300">Booster Pack Tier {quest.rewardBoosterPackTier.slice(-1)}</p>
                        </div>
                         {/* Add form for quest completion here based on quest.questFields */}
                         {getQuestStatus(quest.id) === 'Unlocked' && (
                             <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
                                 Complete Quest
                             </button>
                         )}
                    </div>
                ))}
            </div>
        </Layout>
    );
}