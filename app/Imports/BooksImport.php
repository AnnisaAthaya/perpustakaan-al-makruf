<?php

namespace App\Imports;

use App\Models\Book;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\RemembersRowNumber;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class BooksImport implements SkipsOnError, ToModel, WithBatchInserts, WithChunkReading
{
    use Importable, RemembersRowNumber, SkipsErrors;

    /**
     * Convert CSV row to Book model
     */
    public function model(array $row): ?Book
    {
        // Skip if title is empty (required)
        if (empty($row[0])) {
            return null;
        }

        // Parse stock from multiple book codes
        $stock = $this->parseBookCodes($row[17] ?? '');

        // Clean author name (remove < and >)
        $author = $this->cleanAuthor($row[15] ?? '');

        return new Book([
            'code' => $row[8] ?: null,
            'title' => $row[0],
            'author' => $author ?: null,
            'publisher' => $row[4] ?: null,
            'language' => 'Indonesia',
            'description' => null,
            'isbn' => $row[3] ?: null,
            'stock' => $stock,
            'available' => $stock,
            'cover' => null,
            'category_id' => null,
            'location' => $row[10] ?: null,
            'year' => $row[5] ? (int) $row[5] : null,
        ]);
    }

    /**
     * Chunk size for memory optimization
     */
    public function chunkSize(): int
    {
        return 100;
    }

    /**
     * Batch size for database inserts
     */
    public function batchSize(): int
    {
        return 100;
    }

    /**
     * Parse multiple book codes and count stock
     *
     * Examples:
     * - "<MA7040S>" → stock = 1
     * - "<MA7040S><MA7041S><MA7042S>" → stock = 3
     * - "" → stock = 0
     */
    private function parseBookCodes(string $codesString): int
    {
        if (empty($codesString)) {
            return 0;
        }

        preg_match_all('/<([^>]+)>/', $codesString, $matches);

        return count($matches[1] ?? []);
    }

    /**
     * Clean author name by removing angle brackets
     *
     * Examples:
     * - "<TIM BAITUL KILMAH>" → "TIM BAITUL KILMAH"
     * - "AUTHOR NAME" → "AUTHOR NAME"
     */
    private function cleanAuthor(string $author): string
    {
        return trim($author, '<>');
    }
}
