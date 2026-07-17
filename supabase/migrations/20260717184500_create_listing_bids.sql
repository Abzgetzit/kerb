alter table public.kerb_listings
add column if not exists accept_bids boolean not null default false;

create index if not exists kerb_listings_accept_bids_status_idx
on public.kerb_listings (accept_bids, status, created_at desc);

create table if not exists public.kerb_listing_bids (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  bidder_account_id text,
  bidder_email text,
  bidder_name text,
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'active' check (status in ('active', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists kerb_listing_bids_listing_amount_idx
on public.kerb_listing_bids (listing_id, amount desc, created_at desc);

create index if not exists kerb_listing_bids_account_idx
on public.kerb_listing_bids (bidder_account_id, created_at desc);

alter table public.kerb_listing_bids enable row level security;
