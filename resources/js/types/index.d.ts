export interface Auth {
    user: User;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    notifications?: NotificationData | null;
    flash?: {
        success?: string;
        error?: string;
        importErrors?: string[];
        failedCount?: number;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    nis?: string;
    email: string;
    avatar?: string;
    phone?: string;
    grade?: number;
    class_name?: string;
    date_of_birth?: string;
    address?: string;
    role: 'admin' | 'siswa';
    membership_status: 'active' | 'inactive' | 'suspended';
    email_verified_at: string | null;
    password_changed_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

// Pagination
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Category
export interface Category {
    id: number;
    name: string;
    books_count?: number;
    created_at: string;
    updated_at: string;
}

// Book
export interface Book {
    id: number;
    code: string;
    title: string;
    author: string;
    publisher?: string;
    language: 'indonesian' | 'english' | 'arabic';
    description?: string;
    isbn?: string;
    stock: number;
    available: number;
    cover?: string;
    category_id?: number;
    category?: Category;
    location?: string;
    year?: number;
    is_favorited?: boolean;
    is_saved?: boolean;
    created_at: string;
    updated_at: string;
}

// Loan Status Type
export type LoanStatus = 'pending' | 'active' | 'returned' | 'overdue' | 'rejected' | 'cancelled';

// Loan
export interface Loan {
    id: number;
    user_id: number;
    book_id: number;
    user?: User;
    book?: Book;
    requested_at: string | null;
    borrowed_at: string | null;
    due_date: string | null;
    returned_at: string | null;
    status: LoanStatus;
    status_label?: string;
    status_color?: string;
    confirmed_at?: string | null;
    confirmed_by?: number | null;
    rejection_reason?: string | null;
    cancellation_reason?: string | null;
    notes?: string;
    fine?: Fine;
    is_overdue?: boolean;
    is_pending?: boolean;
    can_cancel?: boolean;
    overdue_days?: number;
    days_remaining?: number;
    estimated_fine?: number;
    created_at: string;
    updated_at: string;
}

// Fine
export interface Fine {
    id: number;
    loan_id: number;
    loan?: Loan;
    amount: number;
    late_days: number;
    status: 'unpaid' | 'pending_verification' | 'paid';
    payment_proof?: string;
    submitted_at?: string;
    verified_at?: string;
    verified_by?: number;
    verifier?: User;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Library Visit
export interface LibraryVisit {
    id: number;
    user_id: number;
    user?: User;
    visited_at: string;
    visited_at_formatted?: string;
    time?: string;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

// Notification
export interface NotificationData {
    data: Notification[];
    unread_count: number;
}

export interface Notification {
    id: string;
    type: string;
    data: NotificationContent;
    read_at: string | null;
    created_at: string;
}

export interface NotificationContent {
    notification_type: string;
    title: string;
    message: string;
    action_url: string | null;
    action_label: string | null;
    metadata: Record<string, unknown>;
}
