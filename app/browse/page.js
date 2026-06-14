"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(number);
}

function getTitle(car) {
  if (car.title) return car.title;

  const title = [car.year, car.make, car.model, car.variant]
    .filter(Boolean)
    .join(" ")
    .trim();

  return title || "Car listing";
}

function getImage(car) {
  if (car.image_url) return car.image_url;
  if (car.photo_url) return car.photo_url;
  if (car.main_photo_url) return car.main_photo_url;
  if (car.cover_image_url) return car.cover_image_url;

  if (Array.isArray(car.photos) && car.photos[0]) return car.photos[0];
  if (Array.isArray(car.images) && car.images[0]) return car.images[0];

  if (typeof car.photos === "string" && car.photos.trim()) {
    try {
      const parsed = JSON.parse(car.photos);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      return car.photos;
    }
  }

  if (typeof car.images === "string" && car.images.trim()) {
    try {
      const parsed = JSON.parse(car.images);
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      return car.images;
    }
  }

  return "/cars/hero-car.png";
}

function getMileage(car) {
  const value = car.mileage || car.miles;
  const number = Number(value);

  if (!value) return "";
  if (!Number.isFinite(number)) return value;

  return `${new Intl.NumberFormat("en-GB").format(number)} miles`;
}

export default function BrowsePage() {
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCars() {
      setLoading(true);
      setErrorMessage("");

      if (!supabase) {
        setErrorMessage("Supabase environment variables are missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("kerb_listings")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Browse page error:", error);
        setErrorMessage(error.message);
        setCars([]);
      } else {
        setCars(data || []);
      }

      setLoading(false);
    }

    loadCars();
  }, []);

  const visibleCars = useMemo(() => {
    let list = [...cars];

    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((car) => {
        const searchableText = [
          car.title,
          car.make,
          car.model,
          car.variant,
          car.year,
          car.fuel,
          car.transmission,
          car.location,
          car.city,
          car.postcode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      });
    }

    if (sort === "price-low") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sort === "price-high") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sort === "mileage-low") {
      list.sort(
        (a, b) =>
          Number(a.mileage || a.miles || 0) -
          Number(b.mileage || b.miles || 0)
      );
    }

    return list;
  }, [cars, search, sort]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <div className="rounded-[32px] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/"
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                ← Back to home
              </Link>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Browse cars
              </h1>

              <p className="mt-3 max-w-2xl text-gray-600">
                Search approved cars listed on Kerb.
              </p>
            </div>

            <Link
              href="/post-car"
              className="rounded-full bg-[#111827] px-6 py-3 text-center text-sm font-black text-white hover:bg-black"
            >
              Post your car
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-[1fr_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search make, model, fuel, location..."
              className="rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="newest">Newest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="mileage-low">Lowest mileage</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="font-bold text-gray-700">
            {loading
              ? "Loading cars..."
              : `${visibleCars.length} car${
                  visibleCars.length === 1 ? "" : "s"
                } found`}
          </p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {loading && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[390px] animate-pulse rounded-[30px] bg-white shadow-sm"
              />
            ))}
          </div>
        )}

        {!loading && !errorMessage && visibleCars.length === 0 && (
          <div className="mt-6 rounded-[32px] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-black">No cars found</h2>
            <p className="mt-2 text-gray-600">
              Approved listings will appear here once they are live.
            </p>
          </div>
        )}

        {!loading && !errorMessage && visibleCars.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCars.map((car) => {
              const title = getTitle(car);
              const image = getImage(car);
              const mileage = getMileage(car);
              const location = car.location || car.city || car.postcode || "";
              const price = car.price || car.asking_price || car.listing_price;

              return (
                <article
                  key={car.id}
                  className="overflow-hidden rounded-[30px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 bg-gray-100">
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/cars/hero-car.png";
                      }}
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-gray-900 backdrop-blur">
                      Kerb verified
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-black">{title}</h2>

                    <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold text-gray-500">
                      {mileage && <span>{mileage}</span>}
                      {car.fuel && <span>• {car.fuel}</span>}
                      {car.transmission && <span>• {car.transmission}</span>}
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-black">
                          {formatPrice(price)}
                        </p>

                        {location && (
                          <p className="mt-1 text-sm text-gray-500">
                            {location}
                          </p>
                        )}
                      </div>

                      <Link
                        href={`/listing/${car.id}`}
                        className="rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
