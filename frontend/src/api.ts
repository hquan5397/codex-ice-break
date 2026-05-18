export type Bike = {
  id: string;
  title: string;
  price: string;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  description?: string | null;
  imageUrl: string;
  imageUrls?: string[];
  sold: boolean;
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

export async function getBikes(): Promise<Bike[]> {
  const response = await fetch(`${API_URL}/bikes`);

  if (!response.ok) {
    throw new Error('Could not load bike listings');
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
