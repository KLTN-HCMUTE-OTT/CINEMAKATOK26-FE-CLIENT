import { useState, useEffect, useMemo } from "react";
import {
  newsControllerGetNews,
  newsControllerGetNewsById,
  newsControllerCreateNews,
  newsControllerUpdateNews,
  newsControllerDeleteNews,
  newsControllerGetRelatedNews,
} from "@/apis/api/news";

// Get all news
export function useNews(params: API.NewsControllerGetNewsParams) {
  const [data, setData] = useState<API.NewsDtoPaginatedResponseDto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize params để tránh re-render không cần thiết
  const serializedParams = useMemo(
    () => JSON.stringify(params),
    [params.page, params.limit, params.search, params.sort],
  );

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const parsedParams = JSON.parse(serializedParams);
        const response = await newsControllerGetNews(parsedParams);
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [serializedParams]);

  return { data, isLoading, error };
}

// Get featured news (first news)
export function useFeaturedNews() {
  const [data, setData] = useState<API.NewsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await newsControllerGetNews({ page: 1, limit: 1 });
        setData(response.data.data[0]);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedNews();
  }, []);

  return { data, isLoading, error };
}

// Get news by ID
export function useNewsById(id: string) {
  const [data, setData] = useState<API.NewsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNewsById = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await newsControllerGetNewsById({ id });
        setData(response.data.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsById();
  }, [id]);

  return { data, isLoading, error };
}

// Get related news
export function useRelatedNews(
  id: string,
  params?: { page?: number; limit?: number },
) {
  const [data, setData] = useState<API.NewsDtoPaginatedResponseDto | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRelatedNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await newsControllerGetRelatedNews({
          newsId: id,
          page: params?.page || 1,
          limit: params?.limit || 6,
        });
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedNews();
  }, [id, params?.page, params?.limit]);

  return { data, isLoading, error };
}

// Create news (Admin)
export function useCreateNews() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createNews = async (newsData: API.CreateNewsBySessionDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await newsControllerCreateNews(newsData);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createNews, isLoading, error };
}

// Update news (Admin)
export function useUpdateNews() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateNews = async (id: string, newsData: API.UpdateNewsDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await newsControllerUpdateNews({ id }, newsData);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateNews, isLoading, error };
}

// Delete news (Admin)
export function useDeleteNews() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteNews = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await newsControllerDeleteNews({ id });
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteNews, isLoading, error };
}
