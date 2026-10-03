<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function text_length(string $value): int
{
    $length = preg_match_all('/./us', $value, $matches);
    return $length === false ? -1 : $length;
}

function connect_database(array $config): PDO
{
    foreach (['db_host', 'db_name', 'db_user', 'db_password', 'db_charset'] as $key) {
        if (!isset($config[$key]) || !is_string($config[$key]) || $config[$key] === '') {
            throw new RuntimeException('Database configuration is incomplete.');
        }
    }

    if ($config['db_name'] === 'SET_YOUR_DATABASE_NAME'
        || $config['db_user'] === 'SET_YOUR_DATABASE_USER'
        || $config['db_password'] === 'SET_YOUR_DATABASE_PASSWORD') {
        throw new RuntimeException('Database configuration has not been completed.');
    }

    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $config['db_host'],
        $config['db_name'],
        $config['db_charset']
    );

    return new PDO($dsn, $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    respond(405, ['error' => 'طريقة الطلب غير مدعومة.']);
}

try {
    $config = require __DIR__ . '/config.php';
    if (!is_array($config)) {
        throw new RuntimeException('Database configuration is invalid.');
    }

    $pdo = connect_database($config);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $pdo->query(
            'SELECT id, name, email, review, rating, created_at
             FROM reviews
             ORDER BY id DESC
             LIMIT 100'
        );
        respond(200, ['reviews' => $statement->fetchAll()]);
    }

    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 8192) {
        respond(413, ['error' => 'حجم البيانات أكبر من المسموح.']);
    }

    $body = file_get_contents('php://input');
    if ($body === false || strlen($body) > 8192) {
        respond(413, ['error' => 'حجم البيانات أكبر من المسموح.']);
    }

    $input = json_decode($body, true);
    if (!is_array($input)) {
        respond(400, ['error' => 'بيانات الطلب غير صالحة.']);
    }

    $name = isset($input['name']) && is_string($input['name']) ? trim($input['name']) : '';
    $email = isset($input['email']) && is_string($input['email']) ? trim($input['email']) : '';
    $review = isset($input['text']) && is_string($input['text']) ? trim($input['text']) : '';
    $rating = filter_var($input['rating'] ?? null, FILTER_VALIDATE_INT);

    $nameLength = text_length($name);
    $reviewLength = text_length($review);
    if ($nameLength < 2 || $nameLength > 80) {
        respond(422, ['error' => 'الاسم مطلوب ويجب أن يكون بين حرفين و80 حرفًا.']);
    }
    if (strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        respond(422, ['error' => 'يرجى إدخال بريد إلكتروني صحيح.']);
    }
    if ($reviewLength < 3 || $reviewLength > 2000) {
        respond(422, ['error' => 'التقييم مطلوب ويجب أن يكون بين 3 و2000 حرف.']);
    }
    if ($rating === false || $rating < 1 || $rating > 5) {
        respond(422, ['error' => 'اختاري تقييمًا من نجمة إلى خمس نجوم.']);
    }

    $statement = $pdo->prepare(
        'INSERT INTO reviews (name, email, review, rating)
         VALUES (:name, :email, :review, :rating)'
    );
    $statement->execute([
        ':name' => $name,
        ':email' => $email,
        ':review' => $review,
        ':rating' => $rating,
    ]);

    respond(201, [
        'review' => [
            'id' => (int) $pdo->lastInsertId(),
            'name' => $name,
            'email' => $email,
            'review' => $review,
            'rating' => $rating,
        ],
    ]);
} catch (Throwable $error) {
    error_log('Reviews API error: ' . $error->getMessage());
    respond(500, ['error' => 'تعذر إكمال الطلب الآن. يرجى المحاولة لاحقًا.']);
}
