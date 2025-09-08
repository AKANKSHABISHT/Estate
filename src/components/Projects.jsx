import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { assets, projectsData } from "../assets/assets";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(1);
  const [cardGap, setCardGap] = useState(16); // gap in px
  const trackRef = useRef(null);
  const [purposeFilter, setPurposeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedProject, setSelectedProject] = useState(null);
  const [negotiationResult, setNegotiationResult] = useState("");

  // Custom Select to avoid Chrome native dropdown overflow on mobile
  const CustomSelect = ({ id, label, value, options, onChange, minWidthClass }) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      const handleEscape = (e) => {
        if (e.key === "Escape") setOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, []);

    return (
      <div className="w-full sm:w-auto min-w-0 relative" ref={wrapperRef}>
        <div className="flex items-center gap-2 overflow-hidden">
          <label htmlFor={id} className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{label}</label>
          <button
            id={id}
            type="button"
            className={`relative border border-gray-300 rounded px-3 pr-8 py-1.5 text-xs sm:text-sm leading-tight h-9 sm:h-10 w-full text-left truncate cursor-pointer ${minWidthClass || ""}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            title={String(value)}
          >
            {String(value)}
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
          </button>
        </div>
        {open && (
          <ul
            role="listbox"
            className={`absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-auto w-full border border-gray-200 bg-white rounded shadow-lg ${minWidthClass || ""}`}
          >
            {options.map((opt) => (
              <li
                key={opt}
                role="option"
                aria-selected={opt === value}
                className={`px-3 py-2 text-xs sm:text-sm truncate cursor-pointer hover:bg-gray-100 ${opt === value ? "bg-gray-50 font-medium" : ""}`}
                onClick={() => { onChange(opt); close(); }}
                title={opt}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth >= 1024) {
        setCardsToShow(4); // desktop
        setCardGap(16); // 16px gap
      } else {
        setCardsToShow(1); // mobile/tablet
        setCardGap(16); // 16px gap
      }
      setCurrentIndex(0);
    };
    updateCardsToShow();
    window.addEventListener("resize", updateCardsToShow);
    return () => window.removeEventListener("resize", updateCardsToShow);
  }, []);

  const uniqueLocations = useMemo(() => {
    const set = new Set(projectsData.map((p) => p.location));
    return ["All", ...Array.from(set)];
  }, []);

  const priceToNumber = (price) => {
    if (!price) return 0;
    const digits = String(price).replace(/[^0-9]/g, "");
    return Number(digits || 0);
  };

  const filteredProjects = useMemo(() => {
    let list = [...projectsData];
    if (purposeFilter !== "All") {
      list = list.filter((p) => p.purpose === purposeFilter);
    }
    if (locationFilter !== "All") {
      list = list.filter((p) => p.location === locationFilter);
    }
    if (sortBy === "price-asc") {
      list.sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => priceToNumber(b.price) - priceToNumber(a.price));
    } else if (sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [purposeFilter, locationFilter, sortBy]);

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [selectedProject]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [purposeFilter, locationFilter, sortBy]);

  const nextProject = () => {
    const max = Math.max(filteredProjects.length - cardsToShow, 0);
    setCurrentIndex((prev) => (prev >= max ? 0 : prev + 1));
  };

  const prevProject = () => {
    const max = Math.max(filteredProjects.length - cardsToShow, 0);
    setCurrentIndex((prev) => (prev === 0 ? max : prev - 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="container mx-auto py-4 pt-20 px-6 md:px-20 lg:px-32 my-20 w-full overflow-hidden"
      id="Projects"
    >
      <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-center">
        Projects &nbsp;
        <span className="underline underline-offset-4 decoration-1 font-light">
          Completed
        </span>
      </h1>
      <p className="text-center text-gray-500 mb-8 max-w-80 mx-auto">
        Crafting Spaces, Building Legacies — Explore Our Portfolio
      </p>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        <CustomSelect
          id="purpose"
          label="Purpose"
          value={purposeFilter}
          options={["All", "Buy", "Rent"]}
          onChange={(val) => setPurposeFilter(val)}
          minWidthClass="sm:min-w-[10rem]"
        />
        <CustomSelect
          id="location"
          label="Location"
          value={locationFilter}
          options={uniqueLocations}
          onChange={(val) => setLocationFilter(val)}
          minWidthClass="sm:min-w-[11rem]"
        />
        <CustomSelect
          id="sort"
          label="Sort"
          value={sortBy}
          options={["relevance", "price-asc", "price-desc", "title"]}
          onChange={(val) => setSortBy(val)}
          minWidthClass="sm:min-w-[12rem]"
        />
        <div className="sm:ml-auto flex items-center gap-3 w-full sm:w-auto min-w-0">
          <span className="text-sm text-gray-500 whitespace-nowrap">{filteredProjects.length} results</span>
          <button
            onClick={() => {
              setPurposeFilter("All");
              setLocationFilter("All");
              setSortBy("relevance");
            }}
            className="text-sm px-3 py-2 border border-gray-300 rounded cursor-pointer w-full sm:w-auto"
            aria-label="Reset filters"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end items-center mb-8">
        <button
          onClick={prevProject}
          className="p-3 bg-gray-200 rounded mr-2 cursor-pointer disabled:opacity-50"
          disabled={filteredProjects.length <= cardsToShow}
          aria-label="Previous Project"
        >
          <img src={assets.left_arrow} alt="previous" />
        </button>
        <button
          onClick={nextProject}
          className="p-3 bg-gray-200 rounded cursor-pointer disabled:opacity-50"
          disabled={filteredProjects.length <= cardsToShow}
          aria-label="Next Project"
        >
          <img src={assets.right_arrow} alt="next" />
        </button>
      </div>

      {/* Slider */}
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex *
              (100 / cardsToShow +
                (cardGap / trackRef.current?.offsetWidth) * 100)
              }%)`,
            gap: `${cardGap}px`,
          }}
        >
          {filteredProjects.length === 0 ? (
            <div className="w-full py-16 text-center text-gray-500">
              No projects match your filters.
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <button
                key={index}
                className="relative flex-shrink-0 text-left focus:outline-none group transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ width: `${100 / cardsToShow}%` }}
                onClick={() => setSelectedProject(project)}
                aria-label={`View details for ${project.title}`}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto mb-14 transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <div className="absolute left-0 right-0 bottom-5 flex justify-center">
                  <div className="inline-block bg-white w-3/4 px-4 py-2 shadow-md shadow-gray-200 rounded-md transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-gray-300">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {project.title}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {project.price} <span className="px-1">|</span>
                      {project.location}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedProject.title} details`}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelectedProject(null);
          }}
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedProject(null)}
          />
          <div className="relative bg-white w-11/12 sm:w-5/6 lg:w-3/4 xl:w-2/3 max-h-[90vh] overflow-y-auto rounded shadow-lg">
            <button
              className="absolute top-3 right-3 p-2 rounded hover:bg-gray-100"
              aria-label="Close details"
              onClick={() => setSelectedProject(null)}
            >
              <img src={assets.cross_icon} alt="close" className="cursor-pointer" />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="border-b lg:border-b-0 lg:border-r">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-2xl font-semibold mb-2">{selectedProject.title}</h3>
                <div className="text-gray-600 mb-4">
                  <span className="font-medium">{selectedProject.purpose}</span>
                  <span className="px-2">•</span>
                  <span>{selectedProject.location}</span>
                </div>
                <div className="text-xl font-bold mb-5">{selectedProject.price}</div>

                <div className="text-gray-700 text-sm leading-relaxed mb-6">
                  Explore this property featuring premium amenities and a prime location. Use the negotiation form below to submit your best offer or request a callback.
                </div>

                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formEl = e.currentTarget;
                    const formData = new FormData(formEl);
                    const name = String(formData.get("name") || "").trim();
                    const email = String(formData.get("email") || "").trim();
                    const offer = String(formData.get("offer") || "").trim();
                    if (!name || !email || !offer) {
                      toast.error("Please fill name, email and your offer.");
                      return;
                    }
                    setNegotiationResult("Sending....");
                    formData.append("access_key", "73ecd808-095e-4aca-9a6f-80182c848c1f");
                    formData.append("subject", `New Offer for ${selectedProject.title}`);
                    formData.append("project", selectedProject.title);
                    formData.append("purpose", selectedProject.purpose);
                    formData.append("location", selectedProject.location);
                    formData.append("listed_price", selectedProject.price);
                    try {
                      const response = await fetch("https://api.web3forms.com/submit", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await response.json();
                      if (data.success) {
                        setNegotiationResult("");
                        toast.success("Offer submitted successfully");
                        formEl.reset();
                        setSelectedProject(null);
                      } else {
                        toast.error(data.message || "Submission failed");
                        setNegotiationResult("");
                      }
                    } catch (err) {
                      toast.error("Network error. Please try again.");
                      setNegotiationResult("");
                    }
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="name" className="block text-xs text-gray-600 mb-1">Name</label>
                      <input id="name" name="name" type="text" className="w-full border rounded px-3 py-2 text-sm" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs text-gray-600 mb-1">Email</label>
                      <input id="email" name="email" type="email" className="w-full border rounded px-3 py-2 text-sm" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="offer" className="block text-xs text-gray-600 mb-1">Your Offer (₹)</label>
                      <input id="offer" name="offer" type="number" min="0" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. 5800000" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs text-gray-600 mb-1">Phone (optional)</label>
                      <input id="phone" name="phone" type="tel" className="w-full border rounded px-3 py-2 text-sm" placeholder="+91-" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="note" className="block text-xs text-gray-600 mb-1">Message (optional)</label>
                    <textarea id="note" name="note" rows="3" className="w-full border rounded px-3 py-2 text-sm" placeholder="Share any conditions or preferred timings" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-4 py-2 bg-black text-white rounded text-sm cursor-pointer">{negotiationResult ? negotiationResult : "Submit Offer"}</button>
                    <button type="button" className="px-4 py-2 border rounded text-sm cursor-pointer" onClick={() => setSelectedProject(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Projects;
