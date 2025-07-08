// File: /pages/profile.js
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { firebaseApp } from '../lib/firebase';
import CardAlbum from '../components/CardAlbum';
import UserInfo from '../components/UserInfo';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }
      } else {
        router.push('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }
  
  if (!user || !userData) {
      return null; // or a redirect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-purple-400">Your Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Logout
          </button>
        </div>
        
        <UserInfo user={user} userData={userData} />

        <div className="my-8 text-center">
            <Link href="/quests" passHref>
                <a className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 mx-2">
                    View Quests
                </a>
            </Link>
             <Link href="/packs" passHref>
                <a className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 mx-2">
                    Open Booster Packs
                </a>
            </Link>
             <Link href="/trade" passHref>
                <a className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 mx-2">
                    Trade Cards
                </a>
            </Link>
        </div>

        <CardAlbum userId={user.uid} />
      </div>
    </div>
  );
}