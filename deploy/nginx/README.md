# nginx snippets for the EC2 deployment

`s3-assets.conf` is installed on the sub.mlrit.ac.in server as
`/etc/nginx/snippets/s3-assets.conf` and included in the site's HTTPS server
block (`include snippets/s3-assets.conf;`).

It serves the files from `public/` out of the S3 bucket
`mlrit-website-assets` (prefix `site/`) instead of the instance disk. URLs do
not change: `/images/x.jpg` is fetched from `s3://mlrit-website-assets/site/images/x.jpg`.
Responses carry `X-Asset-Source: s3`. If a file is not in S3 (403/404), the
request falls back to the Next.js app, so new files in `public/` keep working
until they are uploaded.

Only the `site/` prefix is publicly readable (bucket policy). Payload media
uploads are not served by this snippet.

`/_next/image` still reads images from the local `public/` folder, so `public/`
must stay on the server until next/image is pointed at S3.
