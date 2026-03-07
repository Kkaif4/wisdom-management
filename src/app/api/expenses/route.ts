import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExpenseService } from "@/modules/expenses/expense.service";
import { Prisma } from "@/prisma/generated";
import { errorResponse, successResponse } from "@/lib/api-response";
import { AuthError } from "@/lib/api-errors";

export const GET = auth(async (req) => {
  try {
    if (!req.auth?.user?.organizationId) {
      throw new AuthError();
    }

    const expenses = await prisma.expense.findMany({
      where: { organizationId: req.auth.user.organizationId },
      orderBy: { date: "desc" },
    });

    return successResponse(expenses);
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = auth(async (req) => {
  try {
    if (!req.auth?.user?.organizationId || !req.auth?.user?.id) {
      throw new AuthError();
    }

    const body = await req.json();
    const { amount, paidFrom, category, description, date } = body;

    const expense = await ExpenseService.createExpense({
      organizationId: req.auth.user.organizationId,
      userId: req.auth.user.id,
      amount: new Prisma.Decimal(amount),
      paidFrom,
      category,
      description,
      date: new Date(date),
    });

    return successResponse(expense, "Expense recorded successfully", 201);
  } catch (error: any) {
    return errorResponse(error);
  }
});
