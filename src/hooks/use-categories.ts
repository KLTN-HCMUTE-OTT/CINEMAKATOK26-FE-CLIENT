"use client";

import { categoryControllerFindAll } from "@/apis/api/categories";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { date } from "zod";

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
        const response = await categoryControllerFindAll({
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
