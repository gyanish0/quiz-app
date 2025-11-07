export function Button({ children, ...props }) {
    return (
        <button
            {...props}
            className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${props.className || ''}`}
        >
            {children}
        </button>
    );
}

export function Input({ label, error, ...props }) {
    return (
        <div className="space-y-1 w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                {...props}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${error ? 'border-red-300' : ''
                    }`}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}

export function Card({ children, ...props }) {
    return (
        <div
            {...props}
            className={`bg-white shadow rounded-lg p-6 ${props.className || ''}`}
        >
            {children}
        </div>
    );
}