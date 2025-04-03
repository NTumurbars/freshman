export default function Block({ children, title, tagline }) {
    return (
        <div className="transform rounded-lg bg-white p-6 shadow-xl transition duration-500 hover:scale-105 hover:shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
            <p className="text-3xl font-extrabold text-gray-900">{children}</p>
            <p className="mt-2 text-sm text-gray-500">{tagline}</p>
        </div>
    );
}
