
-- First create storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name) 
values ('avatars', 'avatars') 
on conflict do nothing;

-- Set up proper RLS policies for the storage bucket
create policy "Anyone can view avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'username')
  );
  return new;
end;
$$;

-- Create trigger to execute the handle_new_user function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant execute permission on the function_exists function (from the other migration)
grant execute on function public.function_exists to anon, authenticated;
