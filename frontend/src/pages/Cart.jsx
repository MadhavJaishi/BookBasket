import React, { useState, useEffect, useCallback } from "react";
import Loader from "../components/Loader/Loader";
import axios from "axios";
import { AiFillDelete } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCart as setReduxCart, removeItemFromCart, clearCart } from "../store/cartSlice";
import OptimizedImage from "../components/Image/OptimizedImage";
import { useModal } from "../context/ModalContext";
import AddressSelector from "../components/Address/AddressSelector";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert, showConfirm } = useModal();
  const [Cart, setCart] = useState(null);
  const [Total, setTotal] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const handleSelectAddress = useCallback((addr) => {
    setSelectedAddress((prev) => {
      if (prev?._id === addr?._id) return prev;
      return addr;
    });
  }, []);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchCartData = useCallback(async () => {
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-user-cart`,
        { headers }
      );
      const data = resp.data.data || [];
      setCart(data);
      dispatch(setReduxCart(data));
    } catch (err) {
      console.error("Failed to load cart:", err);
      setCart([]);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  const deleteItem = async (bookid) => {
    showConfirm({
      title: "Remove from Cart",
      message: "Are you sure you want to remove this book from your cart?",
      type: "warning",
      confirmText: "Remove",
      cancelText: "Keep in cart",
      onConfirm: async () => {
        try {
          const response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/remove-book-from-cart/${bookid}`,
            {},
            { headers }
          );
          dispatch(removeItemFromCart(bookid));
          showAlert({
            title: "Item Removed",
            message: response.data.msg || "Book removed from cart.",
            type: "info",
          });
          setCart((prev) => prev.filter((item) => item._id !== bookid));
        } catch (err) {
          showAlert({
            title: "Error",
            message: err.response?.data?.msg || "Failed to remove item",
            type: "error",
          });
        }
      },
    });
  };

  const [originalTotal, setOriginalTotal] = useState(0);

  useEffect(() => {
    if (Cart && Cart.length > 0) {
      const sum = Cart.reduce((acc, item) => {
        const itemPrice = item.discountedPrice !== undefined ? item.discountedPrice : (item.price || 0);
        return acc + itemPrice;
      }, 0);
      const origSum = Cart.reduce((acc, item) => acc + (item.price || 0), 0);
      setTotal(sum);
      setOriginalTotal(origSum);
    } else {
      setTotal(0);
      setOriginalTotal(0);
    }
  }, [Cart]);

  const PlaceOrder = async () => {
    if (!selectedAddress || !selectedAddress.formattedAddress) {
      showAlert({
        title: "Shipping Address Required",
        message: "Please select or add a delivery address to complete your order.",
        type: "warning",
      });
      return;
    }

    showConfirm({
      title: "Confirm Order",
      message: `Place order for ${Cart.length} books totaling ₹${Total} delivering to ${selectedAddress.label || "Home"}?`,
      type: "info",
      confirmText: "Confirm Order",
      cancelText: "Review Cart",
      onConfirm: async () => {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/place-order`,
            {
              order: Cart,
              shippingAddress: selectedAddress.formattedAddress,
            },
            { headers }
          );
          dispatch(clearCart());
          showAlert({
            title: "Order Placed!",
            message: response.data.msg || "Your order has been successfully placed!",
            type: "success",
            onConfirm: () => {
              navigate("/profile/orderHistory");
            },
          });
        } catch (error) {
          showAlert({
            title: "Order Failed",
            message: error.response?.data?.msg || "Failed to place order. Please try again.",
            type: "error",
          });
        }
      },
    });
  };

  return (
    <div className="bg-[#08090a] px-4 sm:px-8 lg:px-12 py-10 min-h-screen max-w-7xl mx-auto">
      {!Cart ? (
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Loader onRetry={fetchCartData} />
        </div>
      ) : Cart.length === 0 ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-zinc-300 font-normal mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-zinc-500 text-sm mb-6">Explore our curated collections and add your next favorite read.</p>
          <button
            onClick={() => navigate("/all-books")}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-6 py-2.5 rounded-full text-xs transition-all cursor-pointer"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <span className="text-xs font-light tracking-widest text-emerald-400 uppercase block mb-1">Checkout</span>
            <h1 className="text-4xl font-serif text-white font-normal">
              Your Book Basket
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Cart Items List */}
              <div className="space-y-4">
                {Cart.map((items, i) => {
                  const itemPrice = items.discountedPrice !== undefined ? items.discountedPrice : items.price;
                  const hasDiscount = items.hasDiscount && itemPrice < items.price;

                  return (
                    <div
                      key={items._id || i}
                      className="w-full rounded-2xl flex flex-col sm:flex-row p-5 bg-zinc-900/50 hover:bg-zinc-900/80 justify-between items-center gap-4 transition-all"
                    >
                      <div className="h-28 w-20 flex-shrink-0 flex items-center justify-center bg-zinc-950 rounded-xl p-1 overflow-hidden">
                        <OptimizedImage
                          src={items.url}
                          alt={items.title}
                          className="h-full w-full object-contain"
                          containerClassName="h-full w-full"
                          objectFit="object-contain"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                          <h2 className="text-lg text-white font-medium">
                            {items.title}
                          </h2>
                          {hasDiscount && (
                            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                              {items.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 font-light mt-1">
                          By {items.author}
                        </p>
                        <p className="text-xs text-zinc-500 line-clamp-2 mt-2 font-light">
                          {items.desc}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-white text-xl font-serif block">
                            &#8377; {itemPrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-zinc-500 line-through font-mono">
                              &#8377; {items.price}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => deleteItem(items._id)}
                          className="p-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <AiFillDelete className="text-base" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Address Selector Card (Up to 3 addresses, 1 primary, real map integration) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 space-y-4">
                <AddressSelector
                  selectedAddressId={selectedAddress?._id}
                  onSelectAddress={handleSelectAddress}
                  isCheckoutMode={true}
                />
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="p-6 bg-zinc-900/60 rounded-3xl sticky top-24 space-y-6 border border-zinc-800/80">
                <h2 className="text-2xl font-serif text-white font-normal">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm text-zinc-300 font-light border-b border-zinc-800 pb-4">
                  <div className="flex justify-between">
                    <span>Items ({Cart.length})</span>
                    <span>&#8377; {originalTotal}</span>
                  </div>
                  {originalTotal > Total && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Promotional Discount</span>
                      <span>- &#8377; {originalTotal - Total}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-400">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-serif text-white">
                  <span>Total Amount</span>
                  <span className="font-semibold text-emerald-400">&#8377; {Total}</span>
                </div>

                {/* Selected Shipping Destination Preview */}
                {selectedAddress && (
                  <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="font-light">Shipping to:</span>
                      <span className="text-emerald-400 font-medium">{selectedAddress.label || "Home"}</span>
                    </div>
                    <p className="text-zinc-200 font-light line-clamp-2 text-[11px] leading-relaxed">
                      {selectedAddress.formattedAddress}
                    </p>
                  </div>
                )}

                <button
                  onClick={PlaceOrder}
                  className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-medium py-3 rounded-full text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
