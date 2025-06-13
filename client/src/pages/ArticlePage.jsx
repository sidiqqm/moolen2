import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

function ArticlePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 8,
    totalTips: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      const url = `https://moolenbackend.shop/api/daily-tip?page=${pagination.currentPage}&limit=${pagination.limit}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const responseData = await response.json();

        if (responseData.status === "success") {
          setArticles(responseData.data || []);
          if (responseData.pagination) {
            setPagination(responseData.pagination);
          }
        } else {
          throw new Error(responseData.message || "Failed to fetch articles");
        }
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch articles:", e);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [pagination.currentPage, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleCardClick = (id) => {
    navigate(`/article/${id}`);
  };

  if (loading) return <p className="pt-40 text-center text-xl">Loading articles...</p>;
  if (error) return <p className="pt-40 text-center text-red-500 text-xl">Error: {error}</p>;

  return (
    <main className="min-h-screen bg-sky-100">
      {/* Hero Section */}
      <div className="pt-8 bg-[#1a86a1]">
        <section
          className="min-h-screen bg-cover bg-center flex items-center justify-end px-10 md:px-20"
          style={{ backgroundImage: "url('/hs_article.png')" }}
        >
          <div className="max-w-4xl text-white text-right">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Mental health is messy.
              <br />
              Your support shouldn’t be.
            </h1>
            <p className="text-lg md:text-xl">
              MooLens turns psychological research into practical tools for real
              life.
              <br />
              Because feeling better is possible, even on hard days.
            </p>
          </div>
        </section>
      </div>

      {/* Library Section */}
      <section className="container mx-auto px-4 py-25">
        <div className="flex flex-col items-center mb-10 pt-10">
          <h2 className="text-4xl font-bold mb-1">Daily Tips & Inspirations</h2>
          <div className="relative">
            <img
              src={"/redline.png"}
              alt="Decorative underline"
              className="object-contain w-48 h-5"
            />
          </div>
        </div>

        {/* Article Cards */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {articles.map((article) => (
              <Card
                key={article.id}
                onClick={() => handleCardClick(article.id)}
                className="overflow-hidden group relative h-72 transform transition duration-500 hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                <div className="absolute inset-0">
                  <img
                    src={article.image_url || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-bold">{article.title}</h3>
                  <p className="text-sm opacity-90 line-clamp-2">
                    {article.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          !loading && <p className="text-center text-gray-600 mt-10">No articles found.</p>
        )}

        {/* Pagination Controls */}
        {articles.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <Button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200"
              aria-label="Previous page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <span className="text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center disabled:opacity-50 hover:bg-gray-200"
              aria-label="Next page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

export default ArticlePage;
