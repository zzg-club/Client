export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <main className="flex flex-col items-center justify-center text-center gap-6">
                <h2 className="text-4xl font-extrabold text-gray-800">
                    Welcome to <span className="text-blue-600">Linkverse</span>
                </h2>
                <p className="text-gray-600 max-w-lg">
                    Your hub for managing and sharing links effortlessly. Explore,
                    organize, and connect like never before.
                </p>
                <div className="flex gap-4 mt-4">
                    <a
                        href="#get-started"
                        className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
                    >
                        Get Started
                    </a>
                    <a
                        href="#learn-more"
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow-md hover:bg-gray-300"
                    >
                        Learn More
                    </a>
                </div>
            </main>
        </div>
    );
}