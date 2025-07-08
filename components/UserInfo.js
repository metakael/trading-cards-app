// File: /components/UserInfo.js
export default function UserInfo({ user, userData }) {
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!"); // Replace with a better notification
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Welcome, {userData.username}!</h2>
            <div className="space-y-3 text-lg">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-400">User ID:</span> 
                    <div className="flex items-center gap-2">
                        <span className="text-purple-300 font-mono">{user.uid}</span>
                        <button onClick={() => handleCopy(user.uid)} className="text-xs bg-gray-700 p-1 rounded">Copy</button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-400">Trading Key:</span> 
                    <div className="flex items-center gap-2">
                       <span className="text-purple-300 font-mono">{userData.tradingKey}</span>
                        <button onClick={() => handleCopy(userData.tradingKey)} className="text-xs bg-gray-700 p-1 rounded">Copy</button>
                    </div>
                </div>
            </div>
        </div>
    );
}