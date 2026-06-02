<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FileType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBookRequest;
use App\Http\Requests\Admin\UpdateBookRequest;
use App\Models\Book;
use App\Models\Category;
use App\Services\StorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search');

        $books = Book::query()
            ->select(['id', 'title', 'author', 'code', 'publisher', 'language', 'description', 'isbn', 'stock', 'available', 'cover'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderBy('title')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Book $book) => [
                'id' => $book->id,
                'title' => $book->title,
                'author' => $book->author,
                'code' => $book->code,
                'publisher' => $book->publisher,
                'language' => $book->language->value,
                'description' => $book->description,
                'isbn' => $book->isbn,
                'stock' => $book->stock,
                'available' => $book->available,
                'cover' => StorageService::url($book->cover, FileType::BookCover),
            ]);

        return Inertia::render('admin/books/index', [
            'books' => $books,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(): Response
    {
        $categories = Category::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/books/create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreBookRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $book = Book::create([
            'title' => $validated['title'],
            'code' => $validated['code'],
            'author' => $validated['author'],
            'publisher' => $validated['publisher'],
            'category_id' => $validated['category_id'],
            'language' => $validated['language'],
            'description' => $validated['description'] ?? null,
            'isbn' => $validated['isbn'] ?? null,
            'location' => $validated['location'] ?? null,
            'year' => $validated['year'] ?? null,
            'stock' => $validated['stock'],
            'available' => $validated['stock'],
        ]);

        if ($request->hasFile('cover')) {
            $path = StorageService::upload($request->file('cover'), FileType::BookCover);
            $book->update(['cover' => $path]);
        }

        return redirect()
            ->route('admin.books.index')
            ->with('success', 'Buku berhasil ditambahkan.');
    }

    public function edit(Book $book): Response
    {
        $categories = Category::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/books/edit', [
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'code' => $book->code,
                'author' => $book->author ?? '',
                'publisher' => $book->publisher,
                'category_id' => $book->category_id,
                'language' => $book->language->value,
                'description' => $book->description ?? '',
                'isbn' => $book->isbn ?? '',
                'location' => $book->location ?? '',
                'year' => $book->year,
                'stock' => $book->stock,
                'available' => $book->available,
                'cover' => StorageService::url($book->cover, FileType::BookCover),
            ],
            'categories' => $categories,
        ]);
    }

    public function update(UpdateBookRequest $request, Book $book): RedirectResponse
    {
        $validated = $request->validated();

        $stockDiff = $validated['stock'] - $book->stock;
        $newAvailable = max(0, $book->available + $stockDiff);

        $book->update([
            'title' => $validated['title'],
            'code' => $validated['code'],
            'author' => $validated['author'],
            'publisher' => $validated['publisher'],
            'category_id' => $validated['category_id'],
            'language' => $validated['language'],
            'description' => $validated['description'] ?? null,
            'isbn' => $validated['isbn'] ?? null,
            'location' => $validated['location'] ?? null,
            'year' => $validated['year'] ?? null,
            'stock' => $validated['stock'],
            'available' => $newAvailable,
        ]);

        if ($request->hasFile('cover')) {
            StorageService::delete($book->cover, FileType::BookCover);
            $path = StorageService::upload($request->file('cover'), FileType::BookCover);
            $book->update(['cover' => $path]);
        }

        return redirect()
            ->route('admin.books.index')
            ->with('success', 'Buku berhasil diperbarui.');
    }

    public function destroy(Book $book): RedirectResponse
    {
        if ($book->loans()->where('status', 'active')->exists()) {
            return redirect()
                ->route('admin.books.index')
                ->with('error', 'Tidak dapat menghapus buku yang sedang dipinjam.');
        }

        StorageService::delete($book->cover, FileType::BookCover);

        $book->delete();

        return redirect()
            ->route('admin.books.index')
            ->with('success', 'Buku berhasil dihapus.');
    }
}
