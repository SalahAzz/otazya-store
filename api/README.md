# Review API setup

The review API requires PHP 7.4 or later with PDO MySQL enabled, plus a MySQL
database. It exposes `GET /api/reviews.php` to list the latest 100 reviews and
`POST /api/reviews.php` to validate and save a review.

## cPanel deployment

1. In cPanel, create a MySQL database and a database user, then grant that user
   all privileges on the database.
2. Open phpMyAdmin, select the new database, and import
   `database/reviews.mysql.sql`.
3. Copy `api/config.example.php` to `api/config.php`, then edit the new file
   with the database name, username, and password shown by your hosting
   provider. `api/config.php` is excluded from Git to prevent database
   credentials from being published. Keep `api/.htaccess` in place to deny
   direct access to this credentials file.
4. Upload the site so `index.html`, `JS/`, `CSS/`, `api/`, and `database/` are
   in the same web root. The API must be reachable at `/api/reviews.php`.
5. Serve the site over HTTPS. PHP will not run when opening `index.html`
   directly from a local `file://` URL.

The API returns review emails to the public page because the review cards
currently display them. Do not collect addresses unless that public display is
intended. Database connection errors are recorded in the PHP error log; API
responses do not expose database credentials or raw SQL errors.
