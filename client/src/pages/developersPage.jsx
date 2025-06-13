import React, { useEffect } from "react";
import '../assets/styles/developer.css';

const developers = [
  {
    id: 1,
    name: "Virgie Beatrice",
    cohort: "Cohort ID : MC319D5X1413",
    learningPath: "Machine Learning",
    university: "Universitas Sumatera Utara",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    contacts: {
      instagram: "nailisafira",
      linkedin: "naili-safira",
      github: "nailisafira",
      email: "virgielimbong@gmail.com",
    },
  },
  {
    id: 2,
    name: "Ivanny Putri Marianto",
    cohort: "Cohort ID : MC319D5X0375",
    learningPath: "Machine Learning",
    university: "Universitas Sumatera Utara",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    contacts: {
      instagram: "rianp",
      linkedin: "rian-pratama",
      github: "rianp",
      email: "ivannyputri@students.usu.ac.id",
    },
  },
  {
    id: 3,
    name: "Margareth Serepine Simanjuntak",
    cohort: "Cohort ID : MC319D5X0736",
    learningPath: "Machine Learning",
    university: "Universitas Sumatera Utara",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
    contacts: {
      instagram: "dewianggraini",
      linkedin: "dewi-anggraini",
      github: "dewiux",
      email: "margareths4167@gmail.com",
    },
  },
  {
    id: 4,
    name: "Muhammad Sidiq",
    cohort: "Cohort ID : FC319D5Y2197",
    learningPath: "Front-end dan Back-end",
    university: "Universitas Sumatera Utara",
    photo: "https://randomuser.me/api/portraits/women/53.jpg",
    contacts: {
      instagram: "sitirahma",
      linkedin: "siti-rahma",
      github: "sitirahma",
      email: "moehammad.siddiq@gmail.com",
    },
  },
  {
    id: 5,
    name: "Naili Safira",
    cohort: "Cohort ID : FC319D5X1754",
    learningPath: "Front-end dan Back-end",
    university: "Universitas Sumatera Utara",
    photo: "https://randomuser.me/api/portraits/men/21.jpg",
    contacts: {
      instagram: "https://www.instagram.com/nlisfra",
      linkedin: "https://www.linkedin.com/in/naili-safira-7857532b4",
      github: "https://github.com/nlisfra",
      email: "nailisafira2004@gmail.com",
    },
  },
  {
    id: 6,
    name: "Keivin Immanuel Akta Purba",
    cohort: "Cohort ID : FC359D5Y1902",
    learningPath: "Front-end dan Back-end",
    university: "Universitas Palangka Raya",
    photo: "https://randomuser.me/api/portraits/men/46.jpg",
    contacts: {
      instagram: "andisaputra",
      linkedin: "andi-saputra",
      github: "andisaputra",
      email: "keivinimmanuelp@gmail.com",
    },
  },
];

function formatUrl(platform, value) {
  if (value.startsWith("http")) return value;
  const baseUrls = {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/in/",
    github: "https://github.com/",
  };
  return `${baseUrls[platform]}${value}`;
}

export default function DeveloperView() {
  useEffect(() => {
    document.body.classList.add('developers-background');
    return () => {
      document.body.classList.remove('developers-background');
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 pt-45">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Developers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {developers.map((dev) => (
          <div
            key={dev.id}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={dev.photo}
              alt={dev.name}
              className="w-32 h-32 rounded-full object-cover mb-4"
            />
            <h2 className="text-xl font-semibold">{dev.name}</h2>
            <p className="text-sm text-gray-500 mb-1">{dev.cohort}</p>
            <p className="text-sm mb-1">
              <strong>Learning Path:</strong> {dev.learningPath}
            </p>
            <p className="text-sm mb-3">{dev.university}</p>
            <div className="flex space-x-4 text-gray-600">
              <a
                href={formatUrl("instagram", dev.contacts.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-pink-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zM12 7a5 5 0 100 10 5 5 0 000-10zm6.5-.5a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" />
                </svg>
              </a>
              <a
                href={formatUrl("linkedin", dev.contacts.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:text-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.98 3.5a2.5 2.5 0 11.001 5.001A2.5 2.5 0 014.98 3.5zM4.75 8.5h4.5v12h-4.5v-12zm6 0h4.25v1.61h.06c.59-1.12 2.04-2.3 4.19-2.3 4.49 0 5.31 2.95 5.31 6.78v7.91h-4.5v-7.01c0-1.67-.03-3.81-2.32-3.81-2.32 0-2.68 1.82-2.68 3.7v7.12h-4.5v-12z" />
                </svg>
              </a>
              <a
                href={formatUrl("github", dev.contacts.github)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="hover:text-gray-900 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.49 0-.24-.01-.87-.01-1.71-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.26-4.56-1.11-4.56-4.93 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.02A9.54 9.54 0 0112 6.8c.85.004 1.71.115 2.51.34 1.91-1.3 2.75-1.02 2.75-1.02.55 1.4.2 2.44.1 2.7.64.7 1.03 1.59 1.03 2.68 0 3.82-2.34 4.67-4.57 4.92.36.31.68.92.68 1.85 0 1.33-.01 2.4-.01 2.72 0 .27.16.58.67.48A10.02 10.02 0 0022 12c0-5.52-4.48-10-10-10z" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-3">{dev.contacts.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}