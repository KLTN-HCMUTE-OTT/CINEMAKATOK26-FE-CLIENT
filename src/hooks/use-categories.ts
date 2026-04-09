"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { categoriesControllerGetCategories } from "@/apis/api/categories";

interface UseCategoriesResult {
  categories: API.CategoryDto[];
  isLoading: boolean;
  error: string | null;
}
export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<API.CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesControllerGetCategories({
          page: 1,
          limit: 100,
        });
        setCategories(response.data.data);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to fetch categories";
        toast.error(errorMsg);
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}
