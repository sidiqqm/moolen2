import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://moolenbackend.shop/api/daily-tip/${id}`);
        if (!response.ok) throw new Error("Article not found");

        const data = await response.json();
        if (data.status === "success") {
          setArticle(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch article");
        }
      } catch (e) {
        setError(e.message);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <p className="text-xl text-gray-700 animate-pulse">Loading article...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <section className="container mx-auto px-4 py-28 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 mb-6 inline-flex items-center hover:underline hover:text-blue-800 transition-colors"
        >
          ← Back
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
          {article.title}
        </h1>

        <img
          src={article.image_url || "/placeholder.svg"}
          alt={article.title}
          className="w-full h-64 md:h-80 object-cover mb-8 rounded-xl shadow-md"
        />

        <div className="prose prose-lg max-w-none text-justify leading-relaxed text-gray-800">
          {/* Menampilkan konten HTML yang aman */}
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default ArticleDetailPage;