import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API, xtenantId } from '../../app.json';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface FetchOptions {
    method?: 'GET' | 'POST';
    body?: any;
    headers?: Record<string, string>;
}

const cache = new Map<string, any>();
let cachedAccessToken: string | null = null;

export function useFetch<T>(
    endpoint: string,
    options: FetchOptions = {},
    autoFetch: boolean = true
) {
    const { method = 'GET', body, headers = {} } = options;

    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<FetchStatus>('idle');
    const [error, setError] = useState<Error | null>(null);

    const hasFetchedRef = useRef(false);
    const controllerRef = useRef<AbortController | null>(null);

    const memoizedBody = useMemo(() => JSON.stringify(body || {}), [body]);
    const memoizedHeaders = useMemo(() => JSON.stringify(headers || {}), [headers]);

    const fetchData = useCallback(async () => {
        const cacheKey = `${endpoint}-${method}-${memoizedBody}`;

        if (cache.has(cacheKey)) {
            setData(cache.get(cacheKey));
            setStatus('success');
            return;
        }

        setStatus('loading');
        setError(null);

        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;

        try {
            // Only read token from AsyncStorage once
            if (!cachedAccessToken) {
                cachedAccessToken = await AsyncStorage.getItem('accessToken');
            }

            const response = await fetch(`${API}${endpoint}`, {
                method,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...(cachedAccessToken && { Authorization: `Bearer ${cachedAccessToken}` }),
                    ...(xtenantId && { 'x-tenant-id': xtenantId }),
                    ...headers,
                },
                body: method === 'POST' ? memoizedBody : undefined,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();

            cache.set(cacheKey, json);

            setData(json);
            setStatus('success');
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setError(err);
                setStatus('error');
            }
        }
    }, [endpoint, method, memoizedBody, memoizedHeaders]);

    useEffect(() => {
        if (!autoFetch || hasFetchedRef.current) return;

        fetchData();
        hasFetchedRef.current = true;

        return () => {
            controllerRef.current?.abort();
        };
    }, [fetchData, autoFetch]);

    return { data, status, error, refetch: fetchData };
}
