export function AddSchedule() {
    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">הוספת אירוע</h2>
            <form>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">שם האירוע</label>
                    <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">תאריך</label>
                    <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">הוסף אירוע</button>
            </form>
        </div>
    );
}