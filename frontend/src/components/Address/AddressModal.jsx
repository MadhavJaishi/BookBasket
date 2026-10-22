import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import {
  HiXMark,
  HiMapPin,
  HiMagnifyingGlass,
  HiCheck,
  HiSparkles,
  HiBuildingOffice2,
  HiHome,
  HiBookmark,
  HiMap,
  HiGlobeAmericas,
} from "react-icons/hi2";
import { useModal } from "../../context/ModalContext";

// Custom Leaflet Pin Icon with glowing emerald styling
const createCustomPinIcon = () => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -100%);">
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45), 0 0 0 3px rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          "></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

const TILE_LAYERS = {
  street: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    options: {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri &mdash; India Street Map",
    },
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri &mdash; Satellite",
    },
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      maxZoom: 19,
      subdomains: "abc",
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
};

const AddressModal = ({
  isOpen,
  onClose,
  initialData = null,
  onAddressSaved,
  totalSavedAddresses = 0,
}) => {
  const { showAlert } = useModal();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapType, setMapType] = useState("street"); // "street" | "satellite" | "osm"
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinLookupLoading, setPinLookupLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    pinCode: "",
    formattedAddress: "",
    lat: 28.6139, // Default New Delhi, India
    lng: 77.209,
    isPrimary: false,
    label: "Home",
  });

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // Sync state when opened or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          street: initialData.street || "",
          city: initialData.city || "",
          state: initialData.state || "",
          pinCode: initialData.pinCode || "",
          formattedAddress: initialData.formattedAddress || "",
          lat: initialData.lat || 28.6139,
          lng: initialData.lng || 77.209,
          isPrimary: Boolean(initialData.isPrimary),
          label: initialData.label || "Home",
        });
      } else {
        setFormData({
          street: "",
          city: "",
          state: "",
          pinCode: "",
          formattedAddress: "",
          lat: 28.6139,
          lng: 77.209,
          isPrimary: totalSavedAddresses === 0,
          label: "Home",
        });
      }
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen, initialData, totalSavedAddresses]);

  // India-accurate Reverse Geocoding
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (response.data) {
        const addr = response.data.address || {};

        // Extract accurate Indian locality components
        const house = addr.house_number || addr.building || addr.flat || "";
        const road = addr.road || addr.street || addr.lane || "";
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.city_district ||
          "";
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.district ||
          addr.county ||
          "";
        const state = addr.state || "";
        const pinCode = addr.postcode || "";

        const streetLine = [house, road, locality]
          .filter(Boolean)
          .join(", ");

        const fullDisplay =
          response.data.display_name ||
          [streetLine, city, state, pinCode, "India"]
            .filter(Boolean)
            .join(", ");

        setFormData((prev) => ({
          ...prev,
          lat,
          lng,
          street: streetLine || prev.street,
          city: city || prev.city,
          state: state || prev.state,
          pinCode: pinCode || prev.pinCode,
          formattedAddress: fullDisplay,
        }));
      }
    } catch (err) {
      console.warn("Reverse geocode warning:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Switch Map Layer (Street vs Satellite vs OSM)
  const switchMapLayer = (type) => {
    setMapType(type);
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const config = TILE_LAYERS[type] || TILE_LAYERS.street;
      tileLayerRef.current = L.tileLayer(config.url, config.options).addTo(
        mapInstanceRef.current
      );
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapInstanceRef.current && mapContainerRef.current) {
        const initialLat = formData.lat || 28.6139;
        const initialLng = formData.lng || 77.209;

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([initialLat, initialLng], 15);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Default to Esri World Street Map (High clarity for Indian streets and colonies)
        const initialConfig = TILE_LAYERS.street;
        tileLayerRef.current = L.tileLayer(
          initialConfig.url,
          initialConfig.options
        ).addTo(map);

        // Marker
        const marker = L.marker([initialLat, initialLng], {
          icon: createCustomPinIcon(),
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          reverseGeocode(pos.lat, pos.lng);
        });

        // Click to place pin
        map.on("click", (e) => {
          marker.setLatLng(e.latlng);
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        if (!formData.formattedAddress) {
          reverseGeocode(initialLat, initialLng);
        }
      } else if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (markerRef.current) {
          const lat = formData.lat || 28.6139;
          const lng = formData.lng || 77.209;
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.setView([lat, lng], 15);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      tileLayerRef.current = null;
    }
  }, [isOpen]);

  // India-Focused Address & PIN Code Search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = [];

        // Check if query is a 6-digit Indian PIN code
        const isIndiaPincode = /^[1-9][0-9]{5}$/.test(q);

        if (isIndiaPincode) {
          try {
            // Query India Postal Directory
            const pinResp = await axios.get(
              `https://api.postalpincode.in/pincode/${q}`
            );
            if (pinResp.data?.[0]?.Status === "Success") {
              const postOffices = pinResp.data[0].PostOffice || [];
              postOffices.slice(0, 3).forEach((po) => {
                results.push({
                  display_name: `${po.Name}, ${po.District}, ${po.State} - ${po.Pincode}, India`,
                  address: {
                    road: po.Name,
                    city: po.District,
                    state: po.State,
                    postcode: po.Pincode,
                  },
                  isPostalPin: true,
                  searchQuery: `${po.Name}, ${po.District}, India`,
                });
              });
            }
          } catch (pinErr) {
            console.warn("Pin lookup error:", pinErr);
          }
        }

        // Query Nominatim restricted specifically to India
        const nominatimResp = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            q
          )}&countrycodes=in&addressdetails=1&limit=6`
        );

        if (nominatimResp.data && nominatimResp.data.length > 0) {
          nominatimResp.data.forEach((item) => {
            results.push({
              display_name: item.display_name,
              lat: item.lat,
              lon: item.lon,
              address: item.address,
            });
          });
        }

        // If still fewer than 2 results, query Photon with India lat/lon bias
        if (results.length < 2) {
          try {
            const photonResp = await axios.get(
              `https://photon.komoot.io/api/?q=${encodeURIComponent(
                q
              )}&lat=20.5937&lon=78.9629&limit=5`
            );
            if (photonResp.data?.features) {
              photonResp.data.features.forEach((feat) => {
                const p = feat.properties || {};
                if (p.countrycode === "IN" || !p.countrycode) {
                  const [lon, lat] = feat.geometry?.coordinates || [];
                  const disp = [
                    p.name,
                    p.street,
                    p.district || p.city,
                    p.state,
                    p.postcode,
                    "India",
                  ]
                    .filter(Boolean)
                    .join(", ");
                  results.push({
                    display_name: disp,
                    lat,
                    lon,
                    address: {
                      road: p.street || p.name,
                      city: p.city || p.district,
                      state: p.state,
                      postcode: p.postcode,
                    },
                  });
                }
              });
            }
          } catch (photonErr) {
            console.warn("Photon lookup error:", photonErr);
          }
        }

        setSearchResults(results);
      } catch (err) {
        console.warn("Search geocode error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const selectSearchResult = async (item) => {
    let lat = item.lat ? parseFloat(item.lat) : null;
    let lon = item.lon ? parseFloat(item.lon) : null;

    // If it was a postal PIN result without lat/lon, geocode the area
    if (item.isPostalPin && (!lat || !lon)) {
      try {
        const geo = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            item.searchQuery || item.display_name
          )}&countrycodes=in&limit=1`
        );
        if (geo.data && geo.data[0]) {
          lat = parseFloat(geo.data[0].lat);
          lon = parseFloat(geo.data[0].lon);
        }
      } catch (e) {
        console.warn("Geo pin fallback error:", e);
      }
    }

    if (lat && lon && mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 16, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lon]);
    }

    const addr = item.address || {};
    const road = addr.road || addr.suburb || addr.neighbourhood || "";
    const city = addr.city || addr.town || addr.village || addr.district || "";
    const state = addr.state || "";
    const pinCode = addr.postcode || "";

    setFormData((prev) => ({
      ...prev,
      lat: lat || prev.lat,
      lng: lon || prev.lng,
      street: road || prev.street,
      city: city || prev.city,
      state: state || prev.state,
      pinCode: pinCode || prev.pinCode,
      formattedAddress: item.display_name,
    }));

    setSearchResults([]);
    setSearchQuery("");
  };

  // Instant Indian PIN Code Auto-Fill when user types in PIN code field
  const handlePinCodeChange = async (e) => {
    const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pinCode: pin }));

    if (pin.length === 6) {
      setPinLookupLoading(true);
      try {
        const pinResp = await axios.get(
          `https://api.postalpincode.in/pincode/${pin}`
        );
        if (pinResp.data?.[0]?.Status === "Success") {
          const po = pinResp.data[0].PostOffice?.[0];
          if (po) {
            setFormData((prev) => ({
              ...prev,
              city: po.District || prev.city,
              state: po.State || prev.state,
              street: prev.street || po.Name,
              formattedAddress: prev.formattedAddress || `${po.Name}, ${po.District}, ${po.State} - ${pin}, India`,
            }));

            // Fly map to this PIN location
            const geo = await axios.get(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                `${po.Name}, ${po.District}, India`
              )}&countrycodes=in&limit=1`
            );
            if (geo.data && geo.data[0] && mapInstanceRef.current && markerRef.current) {
              const lat = parseFloat(geo.data[0].lat);
              const lon = parseFloat(geo.data[0].lon);
              mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.2 });
              markerRef.current.setLatLng([lat, lon]);
              setFormData((prev) => ({ ...prev, lat, lng: lon }));
            }
          }
        }
      } catch (err) {
        console.warn("PIN lookup error:", err);
      } finally {
        setPinLookupLoading(false);
      }
    }
  };

  // Get current device location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert({
        title: "Geolocation Unavailable",
        message: "Your browser does not support automatic geolocation.",
        type: "warning",
      });
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.2 });
          markerRef.current.setLatLng([latitude, longitude]);
        }
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        setIsGeocoding(false);
        showAlert({
          title: "Location Permission Denied",
          message: "Please allow location access or pick your address directly on the map.",
          type: "info",
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      formattedAddress:
        name === "formattedAddress" ? value : prev.formattedAddress,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const effectiveFormatted =
      formData.formattedAddress.trim() ||
      [formData.street, formData.city, formData.state, formData.pinCode, "India"]
        .filter(Boolean)
        .join(", ");

    if (!effectiveFormatted.trim()) {
      showAlert({
        title: "Incomplete Address",
        message: "Please select a location on the map or enter your address details.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pinCode: formData.pinCode,
        formattedAddress: effectiveFormatted,
        lat: formData.lat,
        lng: formData.lng,
        isPrimary: Boolean(formData.isPrimary),
        label: formData.label || "Home",
      };

      let response;
      if (initialData && initialData._id) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/update-address/${initialData._id}`,
          payload,
          { headers }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/add-address`,
          payload,
          { headers }
        );
      }

      showAlert({
        title: "Address Saved",
        message: response.data.msg || "Delivery address saved successfully.",
        type: "success",
      });

      if (onAddressSaved) {
        onAddressSaved(response.data.data);
      }
      onClose();
    } catch (err) {
      showAlert({
        title: "Save Failed",
        message:
          err.response?.data?.msg ||
          "Could not save delivery address. Maximum 3 addresses allowed.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = Boolean(initialData && initialData._id);
  const isOnlyAddress =
    totalSavedAddresses === 0 || (isEditing && totalSavedAddresses === 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HiMapPin className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif text-white font-normal">
                  {isEditing ? "Edit Delivery Address" : "Add Delivery Address"}
                </h2>
                <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                  India Map
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-light">
                High-detail street & sector map for India ({Math.min(totalSavedAddresses + (isEditing ? 0 : 1), 3)}/3 saved)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <HiXMark className="text-lg" />
          </button>
        </div>

        {/* Content Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* India Search Bar & Current Location */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search colony, sector, landmark, area, or 6-digit PIN code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/90 text-zinc-100 pl-10 pr-24 py-2.5 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
                />
                {isSearching ? (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 animate-pulse font-mono">
                    Searching...
                  </div>
                ) : (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 font-light pointer-events-none">
                    India Only
                  </span>
                )}

                {/* Dropdown Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-zinc-900/98 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl z-30 overflow-hidden divide-y divide-zinc-800/60 max-h-56 overflow-y-auto">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSearchResult(item)}
                        className="w-full text-left px-4 py-2.5 hover:bg-zinc-800/80 transition-colors flex items-start gap-2.5 text-xs text-zinc-300 font-light cursor-pointer"
                      >
                        <HiMapPin className="text-emerald-400 text-sm mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{item.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400 text-zinc-300 text-xs font-light transition-all shrink-0 cursor-pointer"
              >
                <HiSparkles className="text-emerald-400 text-xs" />
                <span>My Location</span>
              </button>
            </div>
          </div>

          {/* Interactive Map View with Layer Switcher */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-inner h-60 sm:h-72">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Hint overlay */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <span className="bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-[10px] text-zinc-200 px-3 py-1 rounded-full shadow-lg font-light">
                {isGeocoding
                  ? "Detecting Indian address..."
                  : "Click or drag pin to your exact building/road"}
              </span>
            </div>

            {/* Map Layer Switcher Pills */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-zinc-950/90 backdrop-blur-md p-1 rounded-full border border-zinc-800 shadow-xl">
              <button
                type="button"
                onClick={() => switchMapLayer("street")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  mapType === "street"
                    ? "bg-emerald-500 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Esri Detailed India Street Map"
              >
                <HiMap className="text-xs" />
                <span>Streets</span>
              </button>
              <button
                type="button"
                onClick={() => switchMapLayer("satellite")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all ${
                  mapType === "satellite"
                    ? "bg-emerald-500 text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Satellite Aerial View"
              >
                <HiGlobeAmericas className="text-xs" />
                <span>Satellite</span>
              </button>
            </div>
          </div>

          {/* Form Fields: Allow user to type address directly */}
          <form onSubmit={handleSave} className="space-y-3.5 pt-1">
            {/* Label Pills (Home, Work, Other) */}
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-light block">
                Address Tag
              </label>
              <div className="flex gap-2">
                {[
                  { id: "Home", icon: HiHome },
                  { id: "Work", icon: HiBuildingOffice2 },
                  { id: "Other", icon: HiBookmark },
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, label: id }))}
                    className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-light transition-all border cursor-pointer ${
                      formData.label === id
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-medium"
                        : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="text-xs" />
                    <span>{id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Indian fields: Flat/Colony/Sector, City, State, PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-light block mb-1">
                  Flat / House No. / Colony / Sector
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 302, Palm Heights, Sector 62"
                  className="w-full bg-zinc-900/90 text-zinc-100 px-3.5 py-2 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-light block mb-1">
                  6-Digit Indian PIN Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="pinCode"
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={handlePinCodeChange}
                    placeholder="e.g. 560034"
                    className="w-full bg-zinc-900/90 text-zinc-100 px-3.5 py-2 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
                  />
                  {pinLookupLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 animate-pulse">
                      Auto-filling...
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-light block mb-1">
                  City / District
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City (e.g. Bengaluru, New Delhi)"
                  className="w-full bg-zinc-900/90 text-zinc-100 px-3.5 py-2 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-light block mb-1">
                  State / Union Territory
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State (e.g. Karnataka, Maharashtra)"
                  className="w-full bg-zinc-900/90 text-zinc-100 px-3.5 py-2 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors"
                />
              </div>
            </div>

            {/* Complete Formatted Address Preview */}
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-400 font-light block mb-1.5">
                Complete Formatted Address
              </label>
              <textarea
                name="formattedAddress"
                rows="2"
                value={formData.formattedAddress}
                onChange={handleInputChange}
                placeholder="Full address for book delivery..."
                className="w-full bg-zinc-900/90 text-zinc-100 p-3 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-xs font-light outline-none transition-colors resize-none shadow-inner"
                required
              />
            </div>

            {/* Primary Address Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPrimary"
                  checked={formData.isPrimary || isOnlyAddress}
                  disabled={isOnlyAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPrimary: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-zinc-300 font-light">
                  Set as default primary delivery address
                  {isOnlyAddress && (
                    <span className="text-emerald-400 text-[10px] ml-1.5 font-normal">
                      (Required: primary address)
                    </span>
                  )}
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-full text-xs font-medium transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <HiCheck className="text-sm" />
                <span>Save Delivery Address</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
