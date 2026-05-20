export const bikeBrands = [
  'Honda',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'Benelli',
  'Triumph',
  'Harley-Davidson',
  'GPX',
  'Vespa',
] as const;

export type BikeBrand = (typeof bikeBrands)[number];

export type Bike = {
  id: string;
  title: string;
  price: string;
  brand?: BikeBrand | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  description?: string | null;
  imageUrl: string;
  imageUrls?: string[];
  sold: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  admin: {
    username: string;
  };
  expiresIn: string;
};

export type AdminDashboardSummary = {
  totalListings: number;
  sellingListings: number;
  soldListings: number;
  soldListingsInRange: number;
  revenueInRange: string;
  newestListings: Array<{
    id: string;
    title: string;
    brand?: BikeBrand | null;
    model?: string | null;
    createdAt: string;
  }>;
};

export type DashboardDateRange = {
  from?: string;
  to?: string;
};

export type GetBikesParams = {
  brands?: BikeBrand[];
  search?: string;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function readApiError(response: Response, fallback: string) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => null);
    const message = data?.message ?? data?.error;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  const text = await response.text().catch(() => '');
  return text || fallback;
}

export async function getBikes({ brands = [], search = '' }: GetBikesParams = {}): Promise<Bike[]> {
  const params = new URLSearchParams();
  brands.forEach((brand) => params.append('brand', brand));
  if (search.trim()) {
    params.set('search', search.trim());
  }

  const queryString = params.toString();
  const response = await fetch(`${API_URL}/bikes${queryString ? `?${queryString}` : ''}`);

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Could not load bike listings'));
  }

  return response.json();
}

export async function getBike(id: string): Promise<Bike> {
  const response = await fetch(`${API_URL}/bikes/${id}`);

  if (!response.ok) {
    throw new Error('Bike listing was not found or is no longer available');
  }

  return response.json();
}

export async function getAdminBikes(token: string): Promise<Bike[]> {
  const response = await fetch(`${API_URL}/bikes/admin`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Could not load admin bike listings');
  }

  return response.json();
}

export async function getAdminDashboardSummary(token: string, dateRange: DashboardDateRange = {}): Promise<AdminDashboardSummary> {
  const params = new URLSearchParams();
  if (dateRange.from) {
    params.set('from', dateRange.from);
  }

  if (dateRange.to) {
    params.set('to', dateRange.to);
  }

  const queryString = params.toString();
  const response = await fetch(`${API_URL}/admin/dashboard-summary${queryString ? `?${queryString}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Could not load dashboard summary'));
  }

  return response.json();
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error('Invalid admin username or password');
  }

  return response.json();
}

export async function getCurrentAdmin(token: string): Promise<LoginResponse['admin']> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Admin session expired');
  }

  const data = await response.json();
  return data.admin;
}

export async function createBike(formData: FormData, token: string): Promise<Bike> {
  const response = await fetch(`${API_URL}/bikes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Could not create bike listing'));
  }

  return response.json();
}

export async function updateBikeSold(id: string, sold: boolean, token: string): Promise<Bike> {
  const response = await fetch(`${API_URL}/bikes/${id}/sold`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sold,
    }),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Could not update bike status'));
  }

  return response.json();
}

export async function updateBikePinned(id: string, pinned: boolean, token: string): Promise<Bike> {
  const formData = new FormData();
  formData.append('pinned', String(pinned));

  const response = await fetch(`${API_URL}/bikes/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Could not update pinned status'));
  }

  return response.json();
}

export async function updateBike(id: string, formData: FormData, token: string): Promise<Bike> {
  const response = await fetch(`${API_URL}/bikes/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, 'Could not update bike listing'));
  }

  return response.json();
}
