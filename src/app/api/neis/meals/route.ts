import { NextRequest, NextResponse } from "next/server";
import { fetchNeis } from "@/lib/neis";
import { mapNeisCodeMessage, NeisError } from "@/lib/neis-errors";
import { normalizeYmd } from "@/lib/school";
import { MealItem } from "@/lib/types";

function parseMenuLines(raw: string) {
  return raw
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/&amp;/g, "&")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const officeCode = request.nextUrl.searchParams.get("officeCode") || "";
  const schoolCode = request.nextUrl.searchParams.get("schoolCode") || "";
  const fromYmd = request.nextUrl.searchParams.get("fromYmd") || "";
  const toYmd = request.nextUrl.searchParams.get("toYmd") || "";

  if (!officeCode || !schoolCode || !fromYmd || !toYmd) {
    return NextResponse.json({ message: "조회 조건을 모두 입력해 주세요." }, { status: 400 });
  }

  try {
    const rows = (await fetchNeis<Record<string, string>>("mealServiceDietInfo", {
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE: schoolCode,
      MLSV_FROM_YMD: fromYmd,
      MLSV_TO_YMD: toYmd,
    })) as Array<Record<string, string>>;

    const meals: MealItem[] = rows.map((row) => ({
      mealDate: normalizeYmd(row.MLSV_YMD || ""),
      mealType: row.MMEAL_SC_NM || "급식",
      menuLines: parseMenuLines(row.DDISH_NM || ""),
      calorie: row.CAL_INFO || "",
      nutrition: row.NTR_INFO || "",
      origin: row.ORPLC_INFO || "",
    }));

    meals.sort((a, b) => a.mealDate.localeCompare(b.mealDate));

    return NextResponse.json({ meals });
  } catch (error) {
    if (error instanceof NeisError) {
      const status = error.code === "INFO-200" ? 200 : 502;
      return NextResponse.json({ message: mapNeisCodeMessage(error.code, error.message), code: error.code, meals: [] }, { status });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "급식 정보를 조회하지 못했습니다." },
      { status: 500 },
    );
  }
}
