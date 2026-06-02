<?php

namespace App\Http\Controllers\Siswa;

use App\Enums\LoanStatus;
use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Category;
use App\Models\Loan;
use App\Models\User;
use App\Services\NotificationBuilder;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Display book catalog with search and filter.
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $categoryId = $request->get('category');
        $quickFilter = $request->get('quick_filter');

        $books = Book::query()
            ->with('category')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($quickFilter && Auth::check(), function ($query) use ($quickFilter) {
                $user = Auth::user();

                switch ($quickFilter) {
                    case 'favorites':
                        $query->whereHas('favoritedByUsers', fn ($q) => $q->where('users.id', $user->id));
                        break;

                    case 'saved':
                        $query->whereHas('savedByUsers', fn ($q) => $q->where('users.id', $user->id));
                        break;

                    case 'history':
                        $query->whereHas('loans', fn ($q) => $q->where('user_id', $user->id));
                        break;
                }
            })
            ->orderBy('title')
            ->paginate(12)
            ->withQueryString();

        // Add user interaction status for each book
        if (Auth::check()) {
            $user = Auth::user();
            $favoriteIds = $user->favoriteBooks()->pluck('books.id');
            $savedIds = $user->savedBooks()->pluck('books.id');

            $books->getCollection()->transform(function ($book) use ($favoriteIds, $savedIds) {
                $book->is_favorited = $favoriteIds->contains($book->id);
                $book->is_saved = $savedIds->contains($book->id);

                return $book;
            });
        }

        $categories = Category::query()
            ->withCount('books')
            ->orderBy('name')
            ->get();

        // Get statistics
        $totalBooks = Book::count();
        $borrowedBooks = Loan::where('status', LoanStatus::Active)->count();

        return Inertia::render('books/index', [
            'books' => $books,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category' => $categoryId,
                'quick_filter' => $quickFilter,
            ],
            'stats' => [
                'totalBooks' => $totalBooks,
                'borrowedBooks' => $borrowedBooks,
            ],
            'userStats' => Auth::check() ? [
                'favorites_count' => Auth::user()->favoriteBooks()->count(),
                'saved_count' => Auth::user()->savedBooks()->count(),
                'borrowed_count' => Auth::user()->loans()->count(),
            ] : null,
        ]);
    }

    /**
     * Show book detail.
     */
    public function show(Book $book): Response
    {
        $book->load('category');

        return Inertia::render('books/show', [
            'book' => $book,
        ]);
    }

    /**
     * Request to borrow a book (creates pending loan).
     */
    public function borrow(Request $request, Book $book): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Check if book is available
        if (! $book->isAvailable()) {
            return back()->withErrors(['book' => 'Buku tidak tersedia untuk dipinjam.']);
        }

        // Check if user already has this book on pending or active loan
        $existingLoan = Loan::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->whereIn('status', [LoanStatus::Pending, LoanStatus::Active])
            ->exists();

        if ($existingLoan) {
            return back()->withErrors(['book' => 'Anda sudah memiliki permintaan atau sedang meminjam buku ini.']);
        }

        // Check max ongoing loans (pending + active, limit to 3)
        $ongoingLoansCount = $user->loans()
            ->whereIn('status', [LoanStatus::Pending, LoanStatus::Active])
            ->count();

        if ($ongoingLoansCount >= 3) {
            return back()->withErrors(['book' => 'Anda sudah mencapai batas maksimal peminjaman (3 buku).']);
        }

        // Check if user has unpaid fines
        if ($user->hasUnpaidFines()) {
            return back()->withErrors(['book' => 'Anda memiliki denda yang belum dibayar. Silakan lunasi terlebih dahulu.']);
        }

        // Create loan with pending status (no borrowed_at/due_date yet)
        $loan = Loan::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'requested_at' => Carbon::now(),
            'status' => LoanStatus::Pending,
        ]);

        // Decrease available stock (reserved)
        $book->decreaseAvailable();

        // Send notification to siswa (confirmation)
        $user->notify(NotificationBuilder::loanRequested($loan));

        // Send notification to all admins (new loan request)
        $admins = User::where('role', 'admin')->get();
        Notification::send($admins, NotificationBuilder::newLoanRequest($loan));

        return back()->with('success', "Permintaan peminjaman buku \"{$book->title}\" berhasil dikirim. Menunggu konfirmasi admin.");
    }

    /**
     * Toggle favorite status for a book.
     */
    public function toggleFavorite(Book $book): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->favoriteBooks()->where('book_id', $book->id)->exists()) {
            $user->favoriteBooks()->detach($book->id);
            $message = 'Buku dihapus dari favorit.';
        } else {
            $user->favoriteBooks()->attach($book->id);
            $message = 'Buku ditambahkan ke favorit.';
        }

        return back()->with('success', $message);
    }

    /**
     * Toggle save status for a book.
     */
    public function toggleSave(Book $book): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->savedBooks()->where('book_id', $book->id)->exists()) {
            $user->savedBooks()->detach($book->id);
            $message = 'Buku dihapus dari simpanan.';
        } else {
            $user->savedBooks()->attach($book->id);
            $message = 'Buku disimpan.';
        }

        return back()->with('success', $message);
    }
}
