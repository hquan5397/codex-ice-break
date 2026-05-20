import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Camera,
  Download,
  Gauge,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Search as SearchIcon,
  Star,
  Tag,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  AdminDashboardSummary,
  Bike,
  BikeBrand,
  ListingSort,
  createBike,
  getAdminBikes,
  getAdminDashboardSummary,
  getBike,
  getBikes,
  getCurrentAdmin,
  login as loginAdmin,
  updateBike,
  updateBikePinned,
  updateBikeSold,
  bikeBrands,
} from './api';
import { downloadBikePdf } from './pdf';

type ListingForm = {
  title: string;
  price: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  description: string;
  images: ImageFormItem[];
  pinned: boolean;
};

type EditListingForm = ListingForm & {
  sold: boolean;
};

type ImageFormItem = {
  id: string;
  file?: File;
  url?: string;
  previewUrl: string;
  name: string;
};

const store = {
  name: 'Motorbike Market Thu Duc',
  phone: '0907585397',
  address: 'Lien Phuong, Thu Duc city',
};

const authTokenKey = 'motorbike-admin-token';

const listingSortOptions: Array<{ label: string; value: ListingSort }> = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to high', value: 'price_asc' },
  { label: 'Price: High to low', value: 'price_desc' },
];

const emptyForm: ListingForm = {
  title: '',
  price: '',
  brand: '',
  model: '',
  year: '',
  mileage: '',
  description: '',
  images: [],
  pinned: false,
};

function formFromBike(bike: Bike): EditListingForm {
  return {
    title: bike.title,
    price: String(Math.round(Number(bike.price))),
    brand: bike.brand || '',
    model: bike.model || '',
    year: bike.year ? String(bike.year) : '',
    mileage: bike.mileage !== undefined && bike.mileage !== null ? String(bike.mileage) : '',
    description: bike.description || '',
    images: getBikeImages(bike).map((url, index) => ({
      id: `existing-${index}-${url}`,
      url,
      previewUrl: url,
      name: `Image ${index + 1}`,
    })),
    sold: bike.sold,
    pinned: bike.pinned,
  };
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

function useBikes(loadBikeListings = getBikes) {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const latestRequestId = useRef(0);

  async function loadBikes() {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setIsLoading(true);
    setError('');

    try {
      const bikeListings = await loadBikeListings();
      if (requestId !== latestRequestId.current) {
        return;
      }

      setBikes(bikeListings);
    } catch (loadError) {
      if (requestId !== latestRequestId.current) {
        return;
      }

      setError(loadError instanceof Error ? loadError.message : 'Could not load bikes');
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadBikes();
  }, [loadBikeListings]);

  return {
    bikes,
    error,
    isLoading,
    loadBikes,
    setBikes,
    setError,
  };
}

function useBike(id: string) {
  const [bike, setBike] = useState<Bike | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadBike() {
      setIsLoading(true);
      setError('');

      try {
        const bikeListing = await getBike(id);
        if (isMounted) {
          setBike(bikeListing);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Bike listing was not found');
          setBike(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBike();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return {
    bike,
    error,
    isLoading,
  };
}

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(authTokenKey) || '');
  const [adminUsername, setAdminUsername] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setIsCheckingAuth(false);
      setAdminUsername('');
      return;
    }

    let isMounted = true;

    getCurrentAdmin(token)
      .then((admin) => {
        if (isMounted) {
          setAdminUsername(admin.username);
        }
      })
      .catch(() => {
        localStorage.removeItem(authTokenKey);
        if (isMounted) {
          setToken('');
          setAdminUsername('');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function login(username: string, password: string) {
    const response = await loginAdmin(username, password);
    localStorage.setItem(authTokenKey, response.accessToken);
    setToken(response.accessToken);
    setAdminUsername(response.admin.username);
  }

  function logout() {
    localStorage.removeItem(authTokenKey);
    setToken('');
    setAdminUsername('');
    window.history.replaceState({}, '', '/login');
  }

  return {
    adminUsername,
    isAuthenticated: Boolean(token),
    isCheckingAuth,
    login,
    logout,
    token,
  };
}

function formatBikePrice(price: string) {
  return currencyFormatter.format(Number(price));
}

function bikeMeta(bike: Bike) {
  return [bike.brand, bike.model, bike.year].filter(Boolean).join(' / ') || 'Motorbike';
}

function getBikeImages(bike: Bike) {
  return bike.imageUrls?.length ? bike.imageUrls : [bike.imageUrl].filter(Boolean);
}

function primaryBikeImage(bike: Bike) {
  return getBikeImages(bike)[0] || bike.imageUrl;
}

function cleanupImagePreviews(images: ImageFormItem[]) {
  images.forEach((image) => {
    if (image.file) {
      URL.revokeObjectURL(image.previewUrl);
    }
  });
}

function BikeCard({
  bike,
  isEditing = false,
  isUpdatingStatus = false,
  isUpdatingPinned = false,
  onEdit,
  onTogglePinned,
  onToggleSold,
  variant = 'admin',
}: {
  bike: Bike;
  isEditing?: boolean;
  isUpdatingStatus?: boolean;
  isUpdatingPinned?: boolean;
  onEdit?: (bike: Bike) => void;
  onTogglePinned?: (bike: Bike) => void;
  onToggleSold?: (bike: Bike) => void;
  variant?: 'admin' | 'customer';
}) {
  const isCustomerCard = variant === 'customer';
  const isAdminCard = variant === 'admin';

  return (
    <article className={`bike-card ${isCustomerCard ? 'customer-bike-card' : ''} ${bike.sold ? 'sold-bike-card' : ''} ${bike.pinned ? 'pinned-bike-card' : ''}`}>
      <img src={primaryBikeImage(bike)} alt={bike.title} />
      <div className="bike-content">
        <div>
          {isCustomerCard && bike.pinned && (
            <span className="featured-pill">
              <Star size={14} />
              Featured
            </span>
          )}
          <h3>{bike.title}</h3>
          <p className="meta">{bikeMeta(bike)}</p>
        </div>
        {isAdminCard && <span className={`status-pill ${bike.sold ? 'sold' : 'selling'}`}>{bike.sold ? 'Sold' : 'Selling'}</span>}
        {isAdminCard && bike.pinned && (
          <span className="status-pill pinned">
            <Star size={13} />
            Pinned
          </span>
        )}
        {isAdminCard && <span className="image-count">{getBikeImages(bike).length} image{getBikeImages(bike).length === 1 ? '' : 's'}</span>}
        <strong className="price">{formatBikePrice(bike.price)}</strong>
        <div className="details">
          {bike.mileage !== undefined && bike.mileage !== null && (
            <span>
              <Gauge size={16} />
              {bike.mileage.toLocaleString()} km
            </span>
          )}
          <span>{new Date(bike.createdAt).toLocaleDateString()}</span>
        </div>
        {bike.description && <p className="description">{bike.description}</p>}
        {isAdminCard && (
          <div className="admin-card-actions">
            {onEdit && (
              <button className="status-button" type="button" onClick={() => onEdit(bike)}>
                <Pencil size={16} />
                {isEditing ? 'Editing' : 'Edit'}
              </button>
            )}
            {onToggleSold && (
              <button className="status-button" type="button" onClick={() => onToggleSold(bike)} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? <Loader2 className="spin" size={16} /> : <Tag size={16} />}
                {bike.sold ? 'Mark selling' : 'Mark sold'}
              </button>
            )}
            {onTogglePinned && (
              <button className="status-button" type="button" onClick={() => onTogglePinned(bike)} disabled={isUpdatingPinned}>
                {isUpdatingPinned ? <Loader2 className="spin" size={16} /> : <Star size={16} />}
                {bike.pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
          </div>
        )}
        {isCustomerCard && (
          <div className="customer-card-actions">
            <a className="detail-link" href={`/bikes/${bike.id}`}>
              View details
            </a>
            <button
              className="pdf-button"
              type="button"
              onClick={() => void downloadBikePdf(bike, store)}
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function BrandFilter({
  selectedBrands,
  onClear,
  onToggleBrand,
}: {
  selectedBrands: BikeBrand[];
  onClear: () => void;
  onToggleBrand: (brand: BikeBrand) => void;
}) {
  const selectedSummary = selectedBrands.length === 0 ? 'All brands' : selectedBrands.join(', ');

  return (
    <details className="brand-filter">
      <summary>
        <span>Brand</span>
        <strong>{selectedSummary}</strong>
        <ChevronDown size={17} />
      </summary>
      <div className="brand-filter-menu">
        <button className="brand-filter-clear" type="button" onClick={onClear}>
          All brands
        </button>
        <div className="brand-option-grid">
          {bikeBrands.map((brand) => (
            <label className="brand-option" key={brand}>
              <input
                checked={selectedBrands.includes(brand)}
                type="checkbox"
                onChange={() => onToggleBrand(brand)}
              />
              {brand}
            </label>
          ))}
        </div>
      </div>
    </details>
  );
}

function BikeDetailPage({ id }: { id: string }) {
  const { bike, error, isLoading } = useBike(id);
  const detailImages = bike ? getBikeImages(bike) : [];
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    setSelectedImage(detailImages[0] || '');
  }, [bike?.id]);

  return (
    <main className="detail-page">
      <header className="detail-header">
        <nav className="customer-nav" aria-label="Store navigation">
          <a className="brand" href="/">
            {store.name}
          </a>
          <div className="contact-strip">
            <a href={`tel:${store.phone}`}>
              <Phone size={17} />
              {store.phone}
            </a>
            <span>
              <MapPin size={17} />
              {store.address}
            </span>
          </div>
        </nav>
      </header>

      <section className="detail-shell">
        <a className="back-link" href="/">
          <ArrowLeft size={18} />
          Back to listings
        </a>

        {isLoading ? (
          <div className="empty-state customer-state">
            <Loader2 className="spin" size={28} />
            Loading bike details
          </div>
        ) : error || !bike ? (
          <div className="detail-unavailable">
            <p className="eyebrow">Unavailable</p>
            <h1>Bike listing not found</h1>
            <p>This bike may have been sold or removed. Please call the store for current availability.</p>
            <a className="call-button" href={`tel:${store.phone}`}>
              <Phone size={18} />
              Call store
            </a>
          </div>
        ) : (
          <article className="detail-layout">
            <div className="detail-media">
              <img src={selectedImage || primaryBikeImage(bike)} alt={bike.title} />
              {detailImages.length > 1 && (
                <div className="detail-thumbnails">
                  {detailImages.map((imageUrl, index) => (
                    <button
                      className={imageUrl === selectedImage ? 'active' : ''}
                      key={imageUrl}
                      type="button"
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      <img src={imageUrl} alt={`${bike.title} image ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-content">
              <p className="eyebrow">Bike details</p>
              <h1>{bike.title}</h1>
              <strong className="detail-price">{formatBikePrice(bike.price)}</strong>

              <div className="detail-facts">
                {bike.brand && (
                  <span>
                    <b>Brand</b>
                    {bike.brand}
                  </span>
                )}
                {bike.model && (
                  <span>
                    <b>Model</b>
                    {bike.model}
                  </span>
                )}
                {bike.year && (
                  <span>
                    <b>Year</b>
                    {bike.year}
                  </span>
                )}
                {bike.mileage !== undefined && bike.mileage !== null && (
                  <span>
                    <b>Mileage</b>
                    {bike.mileage.toLocaleString()} km
                  </span>
                )}
                <span>
                  <b>Listed</b>
                  {new Date(bike.createdAt).toLocaleDateString()}
                </span>
              </div>

              {bike.description && (
                <section className="detail-description">
                  <h2>Description</h2>
                  <p>{bike.description}</p>
                </section>
              )}

              <section className="store-panel">
                <h2>{store.name}</h2>
                <a href={`tel:${store.phone}`}>
                  <Phone size={18} />
                  {store.phone}
                </a>
                <span>
                  <MapPin size={18} />
                  {store.address}
                </span>
              </section>

              <div className="detail-actions">
                <a className="call-button" href={`tel:${store.phone}`}>
                  <Phone size={18} />
                  Call store
                </a>
                <button className="pdf-button" type="button" onClick={() => void downloadBikePdf(bike, store)}>
                  <Download size={16} />
                  PDF
                </button>
              </div>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

function CustomerPage() {
  const [selectedBrands, setSelectedBrands] = useState<BikeBrand[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedSort, setSelectedSort] = useState<ListingSort>('newest');
  const loadCustomerBikes = useMemo(
    () => () => getBikes({ brands: selectedBrands, search: debouncedSearchTerm, sort: selectedSort }),
    [debouncedSearchTerm, selectedBrands, selectedSort],
  );
  const { bikes, error, isLoading, loadBikes } = useBikes(loadCustomerBikes);
  const hasListings = bikes.length > 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  function toggleBrand(brand: BikeBrand) {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((currentBrand) => currentBrand !== brand) : [...current, brand],
    );
  }

  return (
    <main className="customer-page">
      <header className="customer-header">
        <nav className="customer-nav" aria-label="Store navigation">
          <a className="brand" href="/">
            {store.name}
          </a>
          <div className="contact-strip">
            <a href={`tel:${store.phone}`}>
              <Phone size={17} />
              {store.phone}
            </a>
            <span>
              <MapPin size={17} />
              {store.address}
            </span>
          </div>
        </nav>

        <section className="customer-hero">
          <div>
            <p className="eyebrow">Xe may Thu Duc</p>
            <h1>Motorbike listings ready to view today</h1>
            <p className="hero-copy">Browse available bikes, compare prices, then call or visit our Thu Duc store.</p>
          </div>
          <a className="call-button" href={`tel:${store.phone}`}>
            <Phone size={18} />
            Call store
          </a>
        </section>
      </header>

      <section className="customer-inventory">
        <div className="inventory-heading">
          <div>
            <p className="eyebrow">Available bikes</p>
            <h2>Current inventory</h2>
          </div>
          <div className="inventory-tools">
            <label className="search-field">
              <span className="sr-only">Search listings</span>
              <SearchIcon size={18} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search title, brand, or model"
                type="search"
              />
            </label>
            <BrandFilter
              selectedBrands={selectedBrands}
              onClear={() => setSelectedBrands([])}
              onToggleBrand={toggleBrand}
            />
            <label className="sort-field">
              <span>Sort</span>
              <span className="select-control">
                <select value={selectedSort} onChange={(event) => setSelectedSort(event.target.value as ListingSort)}>
                  {listingSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} />
              </span>
            </label>
            <button className="icon-button" type="button" onClick={() => void loadBikes()} title="Refresh listings">
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        {isLoading && !hasListings ? (
          <div className="empty-state customer-state">
            <Loader2 className="spin" size={28} />
            Loading bikes for sale
          </div>
        ) : error && !hasListings ? (
          <div className="empty-state customer-state error-state">
            Could not load listings. Please call {store.phone} for current bikes.
          </div>
        ) : !hasListings ? (
          <div className="empty-state customer-state">No bikes are listed right now. Please call {store.phone} for availability.</div>
        ) : (
          <div className={`listing-results ${isLoading ? 'is-refreshing' : ''}`}>
            {error && (
              <div className="listing-error" role="status">
                Could not refresh listings. Please try again.
              </div>
            )}
            <div className="bike-grid customer-grid">
              {bikes.map((bike) => (
                <BikeCard bike={bike} key={bike.id} variant="customer" />
              ))}
            </div>
            {isLoading && (
              <div className="listing-refreshing" role="status">
                <Loader2 className="spin" size={18} />
                Updating listings
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function LoginPage({ onLogin }: { onLogin: (username: string, password: string) => Promise<void> }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin(username, password);
      window.history.replaceState({}, '', '/admin');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not log in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <Lock size={20} />
          <h1>Admin login</h1>
        </div>
        <p className="login-copy">Sign in to upload and manage motorbike listings.</p>

        <label>
          Username
          <input
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
        </label>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="spin" size={18} /> : <Lock size={18} />}
          Log in
        </button>

        {error && <p className="message error">{error}</p>}

        <a className="secondary-link login-public-link" href="/">
          View customer page
        </a>
      </form>
    </main>
  );
}

function ImageManager({
  images,
  isEditing,
  onAddImages,
  onMoveImage,
  onRemoveImage,
}: {
  images: ImageFormItem[];
  isEditing: boolean;
  onAddImages: (files: File[]) => void;
  onMoveImage: (fromIndex: number, toIndex: number) => void;
  onRemoveImage: (id: string) => void;
}) {
  const [draggedImageId, setDraggedImageId] = useState('');

  function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    onAddImages(Array.from(event.target.files || []));
    event.target.value = '';
  }

  function dropOnImage(targetId: string) {
    const fromIndex = images.findIndex((image) => image.id === draggedImageId);
    const toIndex = images.findIndex((image) => image.id === targetId);

    if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
      onMoveImage(fromIndex, toIndex);
    }

    setDraggedImageId('');
  }

  return (
    <div className="image-manager">
      <label className="image-picker compact">
        <input accept="image/png,image/jpeg,image/webp" multiple type="file" onChange={handleFilesChange} />
        <Camera size={28} />
        <span>{isEditing ? 'Add images or reorder existing ones' : 'Choose up to 8 images'}</span>
      </label>

      {images.length > 0 && (
        <div className="image-sort-grid">
          {images.map((image, index) => (
            <article
              className="image-sort-item"
              draggable
              key={image.id}
              onDragEnd={() => setDraggedImageId('')}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={() => setDraggedImageId(image.id)}
              onDrop={() => dropOnImage(image.id)}
            >
              <img src={image.previewUrl} alt={image.name} />
              <div className="image-sort-meta">
                <span>{index === 0 ? 'Primary' : `Image ${index + 1}`}</span>
                <div className="image-sort-actions">
                  <button type="button" onClick={() => onMoveImage(index, index - 1)} disabled={index === 0} title="Move up">
                    <ChevronUp size={15} />
                  </button>
                  <button type="button" onClick={() => onMoveImage(index, index + 1)} disabled={index === images.length - 1} title="Move down">
                    <ChevronDown size={15} />
                  </button>
                  <button type="button" onClick={() => onRemoveImage(image.id)} title="Remove image">
                    <X size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminDashboardSummaryPanel({
  dateFrom,
  dateTo,
  error,
  isLoading,
  onDateFromChange,
  onDateToChange,
  summary,
}: {
  dateFrom: string;
  dateTo: string;
  error: string;
  isLoading: boolean;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  summary: AdminDashboardSummary | null;
}) {
  const stats = [
    ['Total listings', summary?.totalListings ?? 0],
    ['Selling', summary?.sellingListings ?? 0],
    ['Sold', summary?.soldListings ?? 0],
    ['Sold in range', summary?.soldListingsInRange ?? 0],
  ];

  return (
    <section className="dashboard-summary">
      <div className="dashboard-summary-header">
        <div className="panel-heading">
          <Activity size={20} />
          <h2>Dashboard summary</h2>
        </div>
        <div className="date-range-controls">
          <label>
            From
            <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
          </label>
        </div>
      </div>

      <div className="summary-stat-grid">
        {stats.map(([label, value]) => (
          <article className="summary-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
        <article className="summary-stat revenue-stat">
          <span>Revenue in range</span>
          <strong>{formatBikePrice(summary?.revenueInRange ?? '0')}</strong>
        </article>
      </div>

      <div className="newest-listings-summary">
        <h3>Newest listings</h3>
        {summary?.newestListings.length ? (
          <ul>
            {summary.newestListings.map((listing) => (
              <li key={listing.id}>
                <span>{listing.title}</span>
                <small>{[listing.brand, listing.model].filter(Boolean).join(' / ') || 'Motorbike'}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No listings yet.</p>
        )}
      </div>

      {isLoading && (
        <p className="message dashboard-message">
          <Loader2 className="spin" size={16} />
          Loading dashboard summary
        </p>
      )}
      {error && <p className="message error">{error}</p>}
    </section>
  );
}

function AdminPage({
  adminUsername,
  onLogout,
  token,
}: {
  adminUsername: string;
  onLogout: () => void;
  token: string;
}) {
  const loadAdminBikes = useMemo(() => () => getAdminBikes(token), [token]);
  const { bikes, error, isLoading, loadBikes, setBikes, setError } = useBikes(loadAdminBikes);
  const [form, setForm] = useState<ListingForm | EditListingForm>(emptyForm);
  const [editingBikeId, setEditingBikeId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [updatingBikeId, setUpdatingBikeId] = useState('');
  const [pinningBikeId, setPinningBikeId] = useState('');
  const [success, setSuccess] = useState('');
  const [dashboardSummary, setDashboardSummary] = useState<AdminDashboardSummary | null>(null);
  const [dashboardError, setDashboardError] = useState('');
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardDateFrom, setDashboardDateFrom] = useState('');
  const [dashboardDateTo, setDashboardDateTo] = useState('');
  const imageItemsRef = useRef<ImageFormItem[]>([]);
  const editingBike = bikes.find((bike) => bike.id === editingBikeId);
  const isEditing = Boolean(editingBike);

  useEffect(() => {
    imageItemsRef.current = form.images;
  }, [form.images]);

  useEffect(() => {
    return () => {
      cleanupImagePreviews(imageItemsRef.current);
    };
  }, []);

  async function loadDashboardSummary() {
    setIsDashboardLoading(true);
    setDashboardError('');

    try {
      const summary = await getAdminDashboardSummary(token, {
        from: dashboardDateFrom,
        to: dashboardDateTo,
      });
      setDashboardSummary(summary);
    } catch (summaryError) {
      setDashboardError(summaryError instanceof Error ? summaryError.message : 'Could not load dashboard summary');
    } finally {
      setIsDashboardLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboardSummary();
  }, [dashboardDateFrom, dashboardDateTo, token]);

  function updateField(field: keyof EditListingForm, value: string | boolean | ImageFormItem[]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addImages(files: File[]) {
    setError('');
    const validFiles = files.filter((file) => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType || !isValidSize) {
        setError('Images must be JPEG, PNG, or WebP and 5 MB or smaller.');
        return false;
      }

      return true;
    });

    setForm((current) => {
      const availableSlots = 8 - current.images.length;
      const nextImages = validFiles.slice(0, availableSlots).map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      }));

      if (validFiles.length > availableSlots) {
        setError('A listing can contain up to 8 images.');
      }

      return {
        ...current,
        images: [...current.images, ...nextImages],
      };
    });
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= form.images.length) {
      return;
    }

    setForm((current) => {
      const images = [...current.images];
      const [movedImage] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, movedImage);
      return {
        ...current,
        images,
      };
    });
  }

  function removeImage(id: string) {
    setForm((current) => {
      const image = current.images.find((currentImage) => currentImage.id === id);
      if (image?.file) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return {
        ...current,
        images: current.images.filter((currentImage) => currentImage.id !== id),
      };
    });
  }

  function startEditing(bike: Bike) {
    setError('');
    setSuccess('');
    setEditingBikeId(bike.id);
    cleanupImagePreviews(form.images);
    setForm(formFromBike(bike));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEditing() {
    setError('');
    setSuccess('');
    setEditingBikeId('');
    cleanupImagePreviews(form.images);
    setForm(emptyForm);
  }

  function buildCreateFormData() {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'sold' && key !== 'images' && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });
    form.images.forEach((image) => {
      if (image.file) {
        formData.append('images', image.file);
      }
    });

    return formData;
  }

  function buildUpdateFormData() {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', form.price);
    formData.append('brand', form.brand);
    formData.append('model', form.model);
    formData.append('year', form.year);
    formData.append('mileage', form.mileage);
    formData.append('description', form.description);

    if ('sold' in form) {
      formData.append('sold', String(form.sold));
    }

    formData.append('pinned', String(form.pinned));

    formData.append('imageUrls', JSON.stringify(form.images.filter((image) => image.url).map((image) => image.url)));
    let newImageIndex = 0;
    formData.append(
      'imageOrder',
      JSON.stringify(
        form.images.map((image) => {
          if (image.url) {
            return `existing:${image.url}`;
          }

          const token = `new:${newImageIndex}`;
          newImageIndex += 1;
          return token;
        }),
      ),
    );
    form.images.forEach((image) => {
      if (image.file) {
        formData.append('images', image.file);
      }
    });

    return formData;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.images.length === 0) {
      setError('Please choose at least one bike image before publishing.');
      return;
    }

    setIsSaving(true);

    try {
      if (editingBikeId) {
        const updatedBike = await updateBike(editingBikeId, buildUpdateFormData(), token);
        setBikes((current) => current.map((currentBike) => (currentBike.id === updatedBike.id ? updatedBike : currentBike)));
        await loadDashboardSummary();
        setSuccess('Listing updated.');
      } else {
        const newBike = await createBike(buildCreateFormData(), token);
        setBikes((current) => [newBike, ...current]);
        await loadDashboardSummary();
        setSuccess('Listing published.');
      }

      cleanupImagePreviews(form.images);
      setForm(emptyForm);
      setEditingBikeId('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save listing');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleSold(bike: Bike) {
    setError('');
    setSuccess('');
    setUpdatingBikeId(bike.id);

    try {
      const updatedBike = await updateBikeSold(bike.id, !bike.sold, token);
      setBikes((current) => current.map((currentBike) => (currentBike.id === updatedBike.id ? updatedBike : currentBike)));
      await loadDashboardSummary();
      setSuccess(`Listing marked as ${updatedBike.sold ? 'sold' : 'selling'}.`);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not update bike status');
    } finally {
      setUpdatingBikeId('');
    }
  }

  async function handleTogglePinned(bike: Bike) {
    setError('');
    setSuccess('');
    setPinningBikeId(bike.id);

    try {
      const updatedBike = await updateBikePinned(bike.id, !bike.pinned, token);
      setBikes((current) => current.map((currentBike) => (currentBike.id === updatedBike.id ? updatedBike : currentBike)));
      setSuccess(`Listing ${updatedBike.pinned ? 'pinned' : 'unpinned'}.`);
    } catch (pinError) {
      setError(pinError instanceof Error ? pinError.message : 'Could not update pinned status');
    } finally {
      setPinningBikeId('');
    }
  }

  return (
    <main className="app-shell">
      <section className="toolbar">
        <div>
          <p className="eyebrow">Admin motorbike inventory</p>
          <h1>Motorbike Market</h1>
        </div>
        <div className="admin-actions">
          <span className="admin-identity">Signed in as {adminUsername}</span>
          <a className="secondary-link" href="/">
            View customer page
          </a>
          <button className="icon-button" type="button" onClick={() => void loadBikes()} title="Refresh listings">
            <RefreshCcw size={18} />
          </button>
          <button className="icon-button" type="button" onClick={onLogout} title="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </section>

      <AdminDashboardSummaryPanel
        dateFrom={dashboardDateFrom}
        dateTo={dashboardDateTo}
        error={dashboardError}
        isLoading={isDashboardLoading}
        onDateFromChange={setDashboardDateFrom}
        onDateToChange={setDashboardDateTo}
        summary={dashboardSummary}
      />

      <section className="workspace">
        <form className="admin-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            {isEditing ? <Pencil size={20} /> : <Plus size={20} />}
            <h2>{isEditing ? 'Edit listing' : 'Add listing'}</h2>
          </div>

          <label>
            Title
            <input
              required
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Honda SH 150i ABS"
            />
          </label>

          <div className="field-grid">
            <label>
              Price
              <input
                required
                min="0"
                step="1"
                type="number"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                placeholder="68000000"
              />
            </label>
            <label>
              Year
              <input
                min="1900"
                max="2100"
                type="number"
                value={form.year}
                onChange={(event) => updateField('year', event.target.value)}
                placeholder="2022"
              />
            </label>
          </div>

          <div className="field-grid">
            <label>
              Brand
              <span className="select-control">
                <select value={form.brand} onChange={(event) => updateField('brand', event.target.value)}>
                  <option value="">Choose brand</option>
                  {bikeBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} />
              </span>
            </label>
            <label>
              Model
              <input value={form.model} onChange={(event) => updateField('model', event.target.value)} placeholder="SH 150i" />
            </label>
          </div>

          <label>
            Mileage
            <input
              min="0"
              type="number"
              value={form.mileage}
              onChange={(event) => updateField('mileage', event.target.value)}
              placeholder="12500"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Condition, service history, accessories..."
              rows={4}
            />
          </label>

          <ImageManager
            images={form.images}
            isEditing={isEditing}
            onAddImages={addImages}
            onMoveImage={moveImage}
            onRemoveImage={removeImage}
          />

          {isEditing && 'sold' in form && (
            <label className="checkbox-field">
              <input
                checked={form.sold}
                type="checkbox"
                onChange={(event) => updateField('sold' as keyof EditListingForm, event.target.checked)}
              />
              Sold
            </label>
          )}

          <label className="checkbox-field">
            <input
              checked={form.pinned}
              type="checkbox"
              onChange={(event) => updateField('pinned', event.target.checked)}
            />
            Featured on customer page
          </label>

          <button className="primary-button" type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="spin" size={18} /> : isEditing ? <Save size={18} /> : <Plus size={18} />}
            {isEditing ? 'Save changes' : 'Publish listing'}
          </button>

          {isEditing && (
            <button className="secondary-button" type="button" onClick={cancelEditing} disabled={isSaving}>
              <X size={18} />
              Cancel edit
            </button>
          )}

          {(error || success) && <p className={error ? 'message error' : 'message success'}>{error || success}</p>}
        </form>

        <section className="listing-panel">
          <div className="panel-heading">
            <Tag size={20} />
            <h2>Listings</h2>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <Loader2 className="spin" size={28} />
              Loading inventory
            </div>
          ) : error ? (
            <div className="empty-state error-state">
              Could not load admin listings.
              <button className="status-button" type="button" onClick={() => void loadBikes()}>
                <RefreshCcw size={16} />
                Retry
              </button>
            </div>
          ) : bikes.length === 0 ? (
            <div className="empty-state">No listings yet. Add the first bike from the admin panel.</div>
          ) : (
            <div className="bike-grid">
              {bikes.map((bike) => (
                <BikeCard
                  bike={bike}
                  isEditing={editingBikeId === bike.id}
                  isUpdatingPinned={pinningBikeId === bike.id}
                  isUpdatingStatus={updatingBikeId === bike.id}
                  key={bike.id}
                  onEdit={startEditing}
                  onTogglePinned={handleTogglePinned}
                  onToggleSold={handleToggleSold}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export function App() {
  const auth = useAuth();
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const isAdminPage = currentPath === '/admin';
  const isLoginPage = currentPath === '/login';
  const bikeDetailMatch = currentPath.match(/^\/bikes\/([^/]+)$/);

  if (auth.isCheckingAuth && (isAdminPage || isLoginPage)) {
    return (
      <main className="login-page">
        <div className="empty-state customer-state">
          <Loader2 className="spin" size={28} />
          Checking admin session
        </div>
      </main>
    );
  }

  if (isAdminPage) {
    if (!auth.isAuthenticated) {
      return <LoginPage onLogin={auth.login} />;
    }

    return <AdminPage adminUsername={auth.adminUsername} onLogout={auth.logout} token={auth.token} />;
  }

  if (isLoginPage) {
    if (auth.isAuthenticated) {
      window.history.replaceState({}, '', '/admin');
      return <AdminPage adminUsername={auth.adminUsername} onLogout={auth.logout} token={auth.token} />;
    }

    return <LoginPage onLogin={auth.login} />;
  }

  if (bikeDetailMatch) {
    return <BikeDetailPage id={decodeURIComponent(bikeDetailMatch[1])} />;
  }

  return <CustomerPage />;
}
