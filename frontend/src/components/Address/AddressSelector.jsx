import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  HiPlus,
  HiMapPin,
  HiStar,
  HiPencilSquare,
  HiTrash,
  HiCheckBadge,
  HiBuildingOffice2,
  HiHome,
  HiBookmark,
} from "react-icons/hi2";
import AddressModal from "./AddressModal";
import { useModal } from "../../context/ModalContext";

const AddressSelector = ({
  selectedAddressId,
  onSelectAddress,
  isCheckoutMode = true,
  className = "",
}) => {
  const { showAlert, showConfirm } = useModal();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const onSelectAddressRef = useRef(onSelectAddress);
  useEffect(() => {
    onSelectAddressRef.current = onSelectAddress;
  }, [onSelectAddress]);

  const hasAutoSelectedRef = useRef(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/get-addresses`,
        { headers }
      );
      const list = response.data.data || [];
      setAddresses(list);

      // Auto-select primary address only once on initial load
      if (list.length > 0 && !hasAutoSelectedRef.current) {
        hasAutoSelectedRef.current = true;
        const primary = list.find((a) => a.isPrimary) || list[0];
        if (onSelectAddressRef.current) {
          onSelectAddressRef.current(primary);
        }
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleMakePrimary = async (e, addressId) => {
    e.stopPropagation();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/set-primary-address/${addressId}`,
        {},
        { headers }
      );
      setAddresses(response.data.data);
      const newPrimary = response.data.data.find((a) => a.isPrimary);
      if (newPrimary && onSelectAddressRef.current) {
        onSelectAddressRef.current(newPrimary);
      }
      showAlert({
        title: "Primary Address Updated",
        message: "This address has been designated as your default shipping destination.",
        type: "success",
      });
    } catch (err) {
      showAlert({
        title: "Update Failed",
        message: err.response?.data?.msg || "Could not set primary address.",
        type: "error",
      });
    }
  };

  const handleDelete = (e, addressId) => {
    e.stopPropagation();
    showConfirm({
      title: "Remove Address",
      message: "Are you sure you want to delete this saved delivery destination?",
      type: "warning",
      confirmText: "Delete",
      cancelText: "Keep",
      onConfirm: async () => {
        try {
          const response = await axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/delete-address/${addressId}`,
            { headers }
          );
          const updated = response.data.data || [];
          setAddresses(updated);
          if (updated.length > 0) {
            const nextPrimary = updated.find((a) => a.isPrimary) || updated[0];
            if (onSelectAddressRef.current) onSelectAddressRef.current(nextPrimary);
          } else if (onSelectAddressRef.current) {
            onSelectAddressRef.current(null);
          }
          showAlert({
            title: "Address Deleted",
            message: "Address removed from your address book.",
            type: "info",
          });
        } catch (err) {
          showAlert({
            title: "Delete Failed",
            message: err.response?.data?.msg || "Could not delete address.",
            type: "error",
          });
        }
      },
    });
  };

  const handleOpenAdd = () => {
    if (addresses.length >= 3) {
      showAlert({
        title: "Maximum Limit Reached",
        message:
          "You can store up to 3 addresses. Please edit or delete an existing address to add a new one.",
        type: "warning",
      });
      return;
    }
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (e, address) => {
    e.stopPropagation();
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleAddressSaved = (updatedAddresses) => {
    setAddresses(updatedAddresses);
    if (updatedAddresses && updatedAddresses.length > 0) {
      const primary = updatedAddresses.find((a) => a.isPrimary) || updatedAddresses[0];
      if (onSelectAddressRef.current) onSelectAddressRef.current(primary);
    }
  };

  const getTagIcon = (label) => {
    switch (label) {
      case "Work":
        return <HiBuildingOffice2 className="text-xs" />;
      case "Other":
        return <HiBookmark className="text-xs" />;
      default:
        return <HiHome className="text-xs" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header section with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiMapPin className="text-emerald-400 text-base" />
          <h3 className="text-sm uppercase tracking-wider text-zinc-300 font-medium">
            Shipping Destination
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
            {addresses.length}/3 saved
          </span>
        </div>

        {addresses.length < 3 && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-full transition-all cursor-pointer"
          >
            <HiPlus className="text-xs" />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 animate-pulse text-xs text-zinc-500 text-center font-light">
          Loading saved addresses...
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State: Prompt user to add address via map */
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/30 border border-dashed border-zinc-800 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <HiMapPin className="text-2xl" />
          </div>
          <div>
            <h4 className="text-base font-serif text-white font-normal">
              No Shipping Address Added Yet
            </h4>
            <p className="text-xs text-zinc-400 font-light mt-1 max-w-md mx-auto">
              Drop a pin on our real interactive map or enter your address manually to complete your order.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-6 py-2.5 rounded-full text-xs transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <HiPlus className="text-xs" />
            <span>Select Address on Map</span>
          </button>
        </div>
      ) : (
        /* List of Addresses (Max 3) */
        <div className="grid grid-cols-1 gap-3">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId
              ? selectedAddressId === addr._id
              : addr.isPrimary;

            return (
              <div
                key={addr._id}
                onClick={() => onSelectAddressRef.current && onSelectAddressRef.current(addr)}
                className={`relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900/90 border-emerald-500/80 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/20"
                    : "bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Radio & Details */}
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Custom Radio Button */}
                    <div className="pt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-emerald-400 bg-emerald-500"
                            : "border-zinc-600 bg-zinc-900"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {/* Badges: Tag + Primary */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                          {getTagIcon(addr.label)}
                          <span>{addr.label || "Home"}</span>
                        </span>

                        {addr.isPrimary && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <HiCheckBadge className="text-xs" />
                            <span>Primary Address</span>
                          </span>
                        )}
                      </div>

                      {/* Formatted Address */}
                      <p className="text-xs sm:text-sm text-zinc-200 font-light leading-relaxed">
                        {addr.formattedAddress}
                      </p>

                      {/* Granular details if available */}
                      {(addr.city || addr.state || addr.pinCode) && (
                        <p className="text-[11px] text-zinc-400 font-light">
                          {[addr.street, addr.city, addr.state, addr.pinCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {!addr.isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => handleMakePrimary(e, addr._id)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-light text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer"
                        title="Set as default shipping address"
                      >
                        Make Primary
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(e, addr)}
                      className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Edit on map or tweak text"
                    >
                      <HiPencilSquare className="text-sm" />
                    </button>

                    {addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, addr._id)}
                        className="p-1.5 rounded-full text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete address"
                      >
                        <HiTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Map & Edit Modal */}
      <AddressModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onAddressSaved={handleAddressSaved}
        totalSavedAddresses={addresses.length}
      />
    </div>
  );
};

export default AddressSelector;
