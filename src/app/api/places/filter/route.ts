import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Fetches filters from the backend API.
 * @returns {Promise<NextResponse>} JSON response containing filters data.
 */
export async function fetchFilters(): Promise<NextResponse> {
  try {
    if (!API_BASE_URL) {
      console.error('API_BASE_URL is not defined in environment variables.');
      return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }

    const response = await fetch(`${API_BASE_URL}/api/places/filter`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch filters' }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}