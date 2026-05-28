import { Injectable } from '@angular/core';
import { createClient, InsForgeClient } from '@insforge/sdk';

@Injectable({
  providedIn: 'root'
})
export class InsforgeService {
  private readonly client: InsForgeClient;

  constructor() {
    this.client = createClient({
      baseUrl: 'https://7g5uyzjm.eu-central.insforge.app',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODQ4Njd9.Us0hikbWB1xtbJASesGe9y0CEKWcfVgZjauI6_RFcPs'
    });
  }

  getDatabase() {
    return this.client.database;
  }
}
