import type { SupabaseClient } from "@supabase/supabase-js";

export interface PaymentEvent {
  id: string;
  paymentIntentId: string;
  eventType: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

function mapPaymentEventFromDb(row: Record<string, unknown>): PaymentEvent {
  return {
    id: row.id as string,
    paymentIntentId: row.payment_intent_id as string,
    eventType: row.event_type as string,
    payload: row.payload as Record<string, unknown> | null,
    createdAt: row.created_at as string,
  };
}

export async function createEvent(
  supabase: SupabaseClient,
  event: {
    paymentIntentId: string;
    eventType: string;
    payload?: Record<string, unknown>;
  }
): Promise<PaymentEvent> {
  const { data, error } = await supabase
    .from("payment_events")
    .insert({
      payment_intent_id: event.paymentIntentId,
      event_type: event.eventType,
      payload: event.payload || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPaymentEventFromDb(data);
}

export async function getEventsByIntent(
  supabase: SupabaseClient,
  intentId: string
): Promise<PaymentEvent[]> {
  const { data, error } = await supabase
    .from("payment_events")
    .select("*")
    .eq("payment_intent_id", intentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapPaymentEventFromDb);
}
