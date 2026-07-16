alter table public.kerb_listings
add column if not exists accept_bids boolean not null default false;

create index if not exists kerb_listings_accept_bids_status_idx
on public.kerb_listings (accept_bids, status, created_at desc);
