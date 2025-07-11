import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Loader from "../components/Loader";

interface WardrobeItem {
  id: string;
  user_id: string;
  category: string;
  type: string;
  brand: string;
  size: string;
  color: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export default function WardrobeItems() {
  const [products, setProducts] = useState<WardrobeItem[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wardrobe-items`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.items);
      } else {
        alert(`Failed to fetch items: ${data.message}`);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      alert("An error occurred while fetching items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirm) return;

    try {
      setLoadingId(id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/wardrobe-items/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete item");
      }

      // Remove item from UI
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setLoadingId(null);
    }
  };

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-GB", {
      dateStyle: "medium",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl lg:max-w-7xl lg:px-4">
      <div className="mb-6 flex items-center justify-center gap-x-4">
        <Link
          href="/add-item"
          className="w-1/2 text-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Add Item to Wardrobe
        </Link>
        <Link
          href="/virtual-tryon"
          className="w-1/2 text-center rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          View your Virtual Try-ons
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-8">
          You have no wardrobe items yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 xl:gap-x-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative border p-2 rounded-lg shadow-sm"
            >
              <Image
                alt={`Image of a ${product.category.toLowerCase()} from ${
                  product.brand
                }`}
                src={
                  product.image_url
                    ? product.image_url
                    : "https://dummyimage.com/300x600/cccccc/000000&text=No+Image+Uploaded"
                }
                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:h-80"
                width={200}
                height={200}
              />
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                {product.brand} {capitalize(product.category)}
              </h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span>{" "}
                {capitalize(product.type)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Color:</span>{" "}
                {capitalize(product.color)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Size:</span>{" "}
                {product.size.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Added:</span>{" "}
                {formatDate(product.created_at)}
              </p>

              <button
                onClick={() => handleDelete(product.id)}
                disabled={loadingId === product.id}
                className={`mt-3 text-sm px-3 py-1.5 rounded-md font-semibold shadow-sm ${
                  loadingId === product.id
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-500"
                }`}
              >
                {loadingId === product.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
