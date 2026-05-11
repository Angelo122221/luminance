import type { APIRoute } from "astro";
import { getBudgetState, saveBudgetState, type PersistedBudgetState } from "../../lib/budgetStore";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const budget = await getBudgetState();
    return new Response(JSON.stringify({ budget }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to load budget data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as { budget?: PersistedBudgetState };

    if (!body?.budget) {
      return new Response(JSON.stringify({ error: "Missing budget payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await saveBudgetState(body.budget);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to save budget data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
