import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useModal } from "../../context/ModalContext";
import { FaBook, FaPlus, FaImage, FaArrowLeft, FaCheck, FaWandMagicSparkles } from "react-icons/fa6";

const AddBook = () => {
  const navigate = useNavigate();
  const { showAlert } = useModal();
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    url: "",
    title: "",
    author: "",
    genre: "Fiction",
    price: "",
    discountPercent: "0",
    desc: "",
    language: "English",
    isbn: "",
    publisher: "",
    publishedDate: "",
    pageCount: "",
  });

  const headers = {
    id: localStorage.getItem("id"),
    userid: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!data.title || !data.author || !data.price || !data.desc) {
      showAlert({
        title: "Incomplete Details",
        message: "Please fill in Title, Author, Price, and Synopsis.",
        type: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        discountPercent: Number(data.discountPercent) || 0,
      };
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/add-book`,
        payload,
        { headers }
      );
      showAlert({
        title: "Book Published",
        message: response.data?.msg || `"${data.title}" was successfully added to the catalog!`,
        type: "success",
      });
      navigate("/profile/inventory");
    } catch (error) {
      showAlert({
        title: "Publishing Failed",
        message: error.response?.data?.msg || "Could not publish book to catalog.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full mt-1.5 bg-zinc-950 text-zinc-100 px-4 py-2.5 rounded-2xl border border-zinc-800 focus:border-emerald-500 transition-colors font-light text-xs outline-none";

  const numPrice = Number(data.price) || 0;
  const numDiscount = Number(data.discountPercent) || 0;
  const discountedPreview = numDiscount > 0 ? Math.max(0, Math.round(numPrice * (1 - numDiscount / 100))) : numPrice;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-medium">
            Catalog Management
          </span>
          <h1 className="text-3xl font-serif text-white font-normal mt-1">
            Add New Book to Catalog
          </h1>
          <p className="text-xs text-zinc-400 font-light mt-1">
            Publish a single title with cover images, synopsis, ISBN, price, and custom discount.
          </p>
        </div>

        <Link
          to="/profile/inventory"
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <FaArrowLeft className="text-[10px]" /> Back to Inventory
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Cover Preview */}
          <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-xs uppercase tracking-wider text-zinc-400 font-light">
              Cover Preview
            </span>
            <div className="w-36 h-52 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg relative group">
              {data.url ? (
                <img
                  src={data.url}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-600 p-4">
                  <FaImage className="text-3xl" />
                  <span className="text-[10px] text-zinc-500 font-light">
                    Paste Image URL to preview cover
                  </span>
                </div>
              )}
            </div>

            {numPrice > 0 && (
              <div className="text-center pt-1">
                <span className="text-xs text-zinc-400 block font-light">Preview Price</span>
                <span className="text-sm font-semibold text-white font-mono">
                  &#8377; {discountedPreview}
                </span>
                {numDiscount > 0 && (
                  <span className="text-xs text-zinc-500 line-through font-mono ml-1.5">
                    &#8377; {numPrice} ({numDiscount}% off)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Core Info Fields */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <div>
              <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                Cover Image URL
              </label>
              <input
                type="url"
                name="url"
                value={data.url}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                  Book Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={data.title}
                  onChange={handleChange}
                  placeholder="e.g. The Midnight Library"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                  Author *
                </label>
                <input
                  type="text"
                  name="author"
                  required
                  value={data.author}
                  onChange={handleChange}
                  placeholder="e.g. Matt Haig"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={data.price}
                  onChange={handleChange}
                  placeholder="499"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  min="0"
                  max="99"
                  value={data.discountPercent}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                  Genre / Category
                </label>
                <input
                  type="text"
                  name="genre"
                  value={data.genre}
                  onChange={handleChange}
                  placeholder="Fiction, Mystery..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={data.language}
                  onChange={handleChange}
                  placeholder="English"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metadata & Synopsis */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="flex items-center gap-2">
            <FaWandMagicSparkles className="text-emerald-400 text-xs" />
            <h3 className="text-xs uppercase tracking-wider text-zinc-300 font-medium">
              Extended Metadata & OpenLibrary Enrichment
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                ISBN / ISBN-13
              </label>
              <input
                type="text"
                name="isbn"
                value={data.isbn}
                onChange={handleChange}
                placeholder="e.g. 9780525559474"
                className={inputClass}
              />
              <p className="text-[10px] text-zinc-500 font-light mt-1">
                Enables automated cover & metadata fetching.
              </p>
            </div>

            <div>
              <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={data.publisher}
                onChange={handleChange}
                placeholder="e.g. Viking Books"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
                Page Count
              </label>
              <input
                type="number"
                name="pageCount"
                value={data.pageCount}
                onChange={handleChange}
                placeholder="e.g. 304"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-light uppercase tracking-wider text-zinc-400">
              Synopsis & Description *
            </label>
            <textarea
              name="desc"
              required
              rows="4"
              value={data.desc}
              onChange={handleChange}
              placeholder="Enter a captivating description or synopsis for readers..."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Submit & Reset */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() =>
              setData({
                url: "",
                title: "",
                author: "",
                genre: "Fiction",
                price: "",
                desc: "",
                language: "English",
                isbn: "",
                publisher: "",
                publishedDate: "",
                pageCount: "",
              })
            }
            className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-light transition-colors"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-3 rounded-full text-xs font-medium transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {submitting ? "Publishing..." : <><FaCheck className="text-xs" /> Publish Book</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;
