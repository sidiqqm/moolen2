import { useState } from "react";

function JournalEntries({ entries, onDeleteEntry, onEditEntry }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    mood: "",
    content: "",
  });
  const [expandedEntries, setExpandedEntries] = useState({});

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleDelete = (id) => {
    onDeleteEntry(id);
    setActiveDropdown(null);
  };

    const handleEdit = (entry) => {
      console.log("Editing entry:", entry);  // Log to verify entry and id
      setEditingEntry(entry);
      setEditFormData({
        title: entry.title,
        mood: entry.mood,
        content: entry.content,
        date: entry.date.split("T")[0],  // Ensure the date is in yyyy-MM-dd format
      });
      setActiveDropdown(null);
    };



  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleEditSubmit = (e) => {
      e.preventDefault();
    
      // Check if editingEntry has a valid id
      if (!editingEntry || !editingEntry.id) {
        console.error("Editing entry does not have a valid id", editingEntry);
        return; // Prevent the update if id is missing
      }
    
      // Ensure the date is in 'yyyy-MM-dd' format
      const formattedDate = new Date(editFormData.date).toISOString().split("T")[0];
    
      const updatedEntry = {
        ...editingEntry,
        title: editFormData.title,
        mood: editFormData.mood,
        content: editFormData.content,
        date: formattedDate,  // Format the date as 'yyyy-MM-dd'
      };
    
      console.log("Updated entry:", updatedEntry);  // Log to ensure id and date are correct
    
      onEditEntry(updatedEntry);  // Pass the updated entry
      setEditingEntry(null);  // Close the edit modal
    };



  const toggleExpandEntry = (id) => {
    setExpandedEntries((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getColorByMood = (mood) => {
    const moodColors = {
      happy: "bg-gradient-to-b from-[#FFF100] to-[#FFFCD0] text-[#3B3B00]",
      sad: "bg-gradient-to-br from-[#00A2E5] to-[#FFFFFF] text-[#003B5B]",
      angry: "bg-gradient-to-br from-[#FF5353] to-[#FFF8F8] text-[#5B0000]",
      fear: "bg-gradient-to-br from-[#1E90FF] to-[#5600A1] text-white",
      surprise: "bg-gradient-to-br from-[#D466F2] to-[#FFFFFF] text-[#520A66]",
      disgust: "bg-gradient-to-br from-[#FBFFF3] to-[#6B8E23] text-[#556B2F]",
      neutral: "bg-gradient-to-br from-[#AEAEAE] to-[#E9E1E1] text-[#1A1A1A]",
    };
    return moodColors[mood] || "bg-gradient-to-br from-[#4ADE80] to-[#BBF7D0]";
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="inline-block p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">Anda tidak ada membuat jurnal hari ini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Journal Entry</h2>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="edit-title">
                      Title
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="edit-mood">
                      Mood
                    </label>
                    <select
                      id="edit-mood"
                      name="mood"
                      value={editFormData.mood}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select your mood</option>
                      <option value="happy">😊 Happy</option>
                      <option value="sad">😢 Sad</option>
                      <option value="angry">😠 Angry</option>
                      <option value="fear">😨 Fear</option>
                      <option value="surprise">😲 Surprise</option>
                      <option value="disgust">🤢 Disgust</option>
                      <option value="neutral">😐 Neutral</option>
                    </select>
                  </div>
                
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="edit-content">
                      Your Journal
                    </label>
                    <textarea
                      id="edit-content"  // Use 'content' here for consistency
                      name="content"     // This name matches the required API field
                      value={editFormData.content}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                      required
                    />
                  </div>
                
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="edit-date">
                      Date
                    </label>
                    <input
                      type="date"
                      id="edit-date"
                      name="date"
                      value={editFormData.date} // Bind the date field from form data
                      onChange={handleEditInputChange}  // Handle changes for date
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditingEntry(null)}
                      className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
          </div>
        </div>
      )}

      {/* Journal Entries */}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`${getColorByMood(entry.mood)} p-6 rounded-lg shadow-2xl relative flex flex-col h-full lg:h-[505px] max-h-[505px] border border-gray-500 hover:shadow-lg transition-shadow duration-300 overflow-hidden`}
        >
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg lg:text-xl xl:text-2xl capitalize">
              {entry.title}
            </h3>
            <div className="relative">
              <button
                onClick={() => toggleDropdown(entry.id)}
                className="p-2 hover:bg-black/10 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
              {activeDropdown === entry.id && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Journal Section */}
          <div className="flex flex-col flex-grow overflow-hidden gap-4">
            {/* Image Container */}
            <div className="flex justify-center items-center min-h-[180px]">
                {entry.mood && (
                <img
                src={`/${entry.mood}.png`}
                  alt="Mood Emote"
                  className="max-w-full max-h-[160px]"
                />
              )}
            </div>

            {/* Text Journal */}
            <div className="flex flex-col flex-grow overflow-hidden">
              <div className="overflow-y-auto pr-2 flex-grow">
                <p
                  className={`font-semibold ${
                    expandedEntries[entry.id]
                      ? "text-sm"
                      : "line-clamp-7 text-base"
                  } ${
                    entry.content && entry.content.length < 215
                      ? "text-center"
                      : "text-justify"
                  } px-1`}
                >
                  {entry.content || "No journal entry yet..."}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-medium mt-auto pt-2">
              <span>{formatDate(entry.date) || "No date"}</span>
              {entry.content && entry.content.length > 215 && (
                <button
                  onClick={() => toggleExpandEntry(entry.id)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs"
                >
                  {expandedEntries[entry.id] ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JournalEntries;
