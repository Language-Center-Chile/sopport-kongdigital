import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private readonly supabaseUrl = 'http://localhost:54321';
  private readonly supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
  readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(this.supabaseUrl, this.supabaseKey);
  }
}
