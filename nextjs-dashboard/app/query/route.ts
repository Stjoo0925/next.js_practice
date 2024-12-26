import { db } from "@vercel/postgres";

const client = await db.connect();

async function listInvoices() {
  const data = await client.sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

  return data.rows;
}

export async function GET() {
  try {
    await client.sql`BEGIN`;
    const invoices = await listInvoices();
    await client.sql`COMMIT`;

    return Response.json({
      message: "조회 성공",
      data: invoices,
    });
  } catch (error) {
    await client.sql`ROLLBACK`;
    console.error("조회 오류:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
      },
      {
        status: 500,
      }
    );
  } finally {
    await client.release();
  }
}
