import React, { useState, useEffect } from "react";  // Import useState and useEffect from React
import axios from "axios";
import Calendar from "../components/Calendar";
import JournalEntries from "../components/JournalEntries";
import MarqueeText from "../components/MarqueeText";
import Footer from "../components/Footer";

function DailyJournalPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    mood: "",
    date: new Date().toISOString().split("T")[0],
    content: "",
  });
  const [entries, setEntries] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData && userData.id) {
          setUserId(userData.id); // Set the user ID from localStorage
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      // Fetch journal entries for the logged-in user when userId is available
      axios
        .get(`https://moolenbackend.shop/api/daily-journal?user_id=${userId}`)
        .then((response) => {
          setEntries(response.data.data);  // Assuming your API response returns journal entries in `data`
        })
        .catch((error) => {
          console.error("Error fetching journal entries:", error);
        });
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a new journal entry
    const newEntry = {
      user_id: userId,
      title: formData.title,
      mood: formData.mood,
      date: formData.date,
      content: formData.content,
    };

    axios
      .post("https://moolenbackend.shop/api/daily-journal", newEntry)
      .then((response) => {
        setEntries((prevEntries) => [...prevEntries, response.data.data]);
        setFormData({
          title: "",
          mood: "",
          date: new Date().toISOString().split("T")[0],
          content: "",
        });
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error creating journal entry:", error);
      });
  };

    const handleEditEntry = (updatedEntry) => {
      console.log("Updated entry in parent:", updatedEntry);  // Log to check data
      axios
        .put(`https://moolenbackend.shop/api/daily-journal/${updatedEntry.id}`, updatedEntry)
        .then((response) => {
          setEntries((prevEntries) =>
            prevEntries.map((entry) =>
              entry.id === updatedEntry.id ? updatedEntry : entry
            )
          );
        })
        .catch((error) => {
          console.error("Error updating journal entry:", error);
        });
    };

  const handleDeleteEntry = (id) => {
    axios
      .delete(`https://moolenbackend.shop/api/daily-journal/${id}`)
      .then((response) => {
        setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== id));
      })
      .catch((error) => {
        console.error("Error deleting journal entry:", error);
      });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const filteredEntries = entries.filter((entry) => {
    return new Date(entry.date).toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#AADAFB] to-[#fff] pt-18 font-nunito">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-12 relative">
          <span className="relative z-10">Find Peace in Every Page</span>
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-900 text-white font-medium py-3 px-8 rounded-full hover:bg-indigo-800 transition-colors"
        >
          Pen Down Your Day
        </button>
      </section>

      {/* Journal Entry Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">New Journal Entry</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="mood">
                  Mood
                </label>
                <select
                  id="mood"
                  name="mood"
                  value={formData.mood}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select your mood</option>
                  <option value="happy">😊 Happy</option>
                  <option value="disgust">🤩 Disgust</option>
                  <option value="neutral">😌 Neutral</option>
                  <option value="sad">😢 Sad</option>
                  <option value="angry">😠 Angry</option>
                  <option value="surprise">😲 Surprise</option>
                  <option value="fear">😨 Fear</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="date">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="jurnal">
                  Your Journal
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                  placeholder="Write about your day..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Marquee Banner */}
      <MarqueeText />

      {/* Diary Section */}
      <section className="container mx-auto px-4 pt-24">
        <div className="text-center mb-8 relative">
          <span className="relative inline-block min-w-[16rem] min-h-[4rem] font-bold font-nunito text-4xl">
            Your Diary
          </span>
        </div>

        <div className="">
          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            entries={entries}
          />
          <JournalEntries
            entries={filteredEntries}
            onDeleteEntry={handleDeleteEntry}
            onEditEntry={handleEditEntry}
          />
        </div>
      </section>
      
            {/* Pelangi bergelombang */}
      <div className="relative w-full overflow-hidden mt-16">
        <img
          src="/pelangi.png"
          alt="Pelangi"
          className="relative z-10 mx-auto w-[840px] -mb-20"
        />
      </div>



      {/* Footer */}
      <Footer />
    </div>
  );
}

export default DailyJournalPage;
