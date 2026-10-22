import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useModal } from "../context/ModalContext";

const UpdateBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert } = useModal();
  const [Data, setData] = useState({
    url: "",
    title: "",
    author: "",
    price: "",
    discountPercent: 0,
    genre: "",
    desc: "",
    language: "",
  });

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
    bookid: id,
  };

  const change = (e) => {
    const { name, value } = e.target;
    setData({ ...Data, [name]: value });
  };

  const submit = async () => {
    try {
      if (!Data.title || !Data.author || Data.price === "" || !Data.desc) {
        showAlert({
          title: "Missing Fields",
          message: "Please fill in all the required book fields before saving.",
          type: "warning",
        });
        return;
      }

      const payload = {
        ...Data,
        price: Number(Data.price),
        discountPercent: Number(Data.discountPercent) || 0,
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/update-book`,
        payload,
        { headers }
      );
      showAlert({
        title: "Book Updated",
        message: response.data.msg || "Book details updated successfully.",
        type: "success",
        onConfirm: () => navigate(`/view-book-details/${id}`),
      });
      setTimeout(() => {
        navigate(`/view-book-details/${id}`);
      }, 1000);
    } catch (error) {
      showAlert({
        title: "Error",
        message: error.response?.data?.msg || "Failed to update book details.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get-book-details/${id}`
        );
        const bookData = resp.data.data || {};
        setData({
          ...bookData,
          discountPercent: bookData.adminDiscountPercent !== undefined ? bookData.adminDiscountPercent : (bookData.discountPercent || 0),
        });
      } catch (err) {
        console.error("Failed to load book for update:", err);
      }
    };
    fetch();
  }, [id]);

  const inputClass =
    "w-full mt-2 bg-zinc-950 text-zinc-100 p-3 rounded-2xl border border-zinc-800 focus:border-emerald-500 transition-colors font-light text-sm outline-none";

  const numPrice = Number(Data.price) || 0;
  const numDiscount = Number(Data.discountPercent) || 0;
  const discountedPreview = numDiscount > 0 ? Math.max(0, Math.round(numPrice * (1 - numDiscount / 100))) : numPrice;

  return (
    <div className="bg-[#08090a] min-h-screen px-4 sm:px-8 lg:px-12 py-10 max-w-4xl mx-auto space-y-6 text-zinc-100">
      <div>
        <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">
          Catalog Editor
        </span>
        <h1 className="text-4xl font-serif text-white font-normal">
          Update Book Details
        </h1>
      </div>

      <div className="p-6 sm:p-8 bg-zinc-900/40 rounded-3xl space-y-4">
        <div>
          <label htmlFor="url" className="text-xs font-light uppercase tracking-wider text-zinc-400">
            Image URL
          </label>
          <input
            type="text"
            className={inputClass}
            placeholder="Image URL"
            name="url"
            id="url"
            required
            value={Data.url || ""}
            onChange={change}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="text-xs font-light uppercase tracking-wider text-zinc-400">
              Title
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Title"
              name="title"
              id="title"
              required
              value={Data.title || ""}
              onChange={change}
            />
          </div>
          <div>
            <label htmlFor="author" className="text-xs font-light uppercase tracking-wider text-zinc-400">
              Author
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Author"
              name="author"
              id="author"
              required
              value={Data.author || ""}
              onChange={change}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="price" className="text-xs font-light uppercase tracking-wider text-zinc-400">
              Price (₹) *
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="Price"
              name="price"
              id="price"
              required
              value={Data.price || ""}
              onChange={change}
            />
          </div>

          <div>
            <label htmlFor="discountPercent" className="text-xs font-light uppercase tracking-wider text-zinc-400">
              Discount (%)
            </label>
            <input
              type="number"
              className={inputClass}
              placeholder="0"
              name="discountPercent"
              id="discountPercent"
              min="0"
              max="99"
              value={Data.discountPercent !== undefined ? Data.discountPercent : ""}
              onChange={change}
            />
          </div>

          <div>
            <label htmlFor="genre" className="text-xs font-light uppercase tracking-wider text-zinc-400">
              Genre
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Genre"
              name="genre"
              id="genre"
              value={Data.genre || ""}
              onChange={change}
            />
          </div>

          <div>
            <label htmlFor="language" className="text-xs font-light uppercase tracking-wider text-zinc-400">
              Language
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder="Language"
              name="language"
              id="language"
              required
              value={Data.language || ""}
              onChange={change}
            />
          </div>
        </div>

        {numPrice > 0 && numDiscount > 0 && (
          <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-light">Effective Sale Price:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-emerald-400 font-mono">&#8377; {discountedPreview}</span>
              <span className="text-xs text-zinc-500 line-through font-mono">&#8377; {numPrice}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                {numDiscount}% OFF
              </span>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="desc" className="text-xs font-light uppercase tracking-wider text-zinc-400">
            Description
          </label>
          <textarea
            className={`${inputClass} resize-none`}
            rows="5"
            placeholder="Book description..."
            name="desc"
            id="desc"
            required
            value={Data.desc || ""}
            onChange={change}
          />
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/view-book-details/${id}`)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-light px-6 py-2.5 rounded-full text-xs transition-all"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-7 py-2.5 rounded-full text-xs transition-all shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBook;
