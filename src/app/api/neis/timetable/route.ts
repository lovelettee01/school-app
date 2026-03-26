import { NextRequest, NextResponse } from "next/server";
import { fetchNeis } from "@/lib/neis";
import { mapNeisCodeMessage, NeisError } from "@/lib/neis-errors";
import { normalizeYmd } from "@/lib/school";
import { SchoolLevel, TimetableItem } from "@/lib/types";

function resolveResource(level: SchoolLevel) {
  if (level === "elementary") {
    return "elsTimetable";
  }
  if (level === "high") {
    return "hisTimetable";
  }
  return "misTimetable";
}

export async function GET(request: NextRequest) {
  const officeCode = request.nextUrl.searchParams.get("officeCode") || "";
  const schoolCode = request.nextUrl.searchParams.get("schoolCode") || "";
  const schoolLevel = (request.nextUrl.searchParams.get("schoolLevel") || "middle") as SchoolLevel;
  const grade = request.nextUrl.searchParams.get("grade") || "";
  const classNo = request.nextUrl.searchParams.get("classNo") || "";
  const fromYmd = request.nextUrl.searchParams.get("fromYmd") || "";
  const toYmd = request.nextUrl.searchParams.get("toYmd") || "";

  if (!officeCode || !schoolCode || !grade || !classNo || !fromYmd || !toYmd) {
    return NextResponse.json(
      { message: "조회 조건을 모두 입력해 주세요." },
      { status: 400 },
    );
  }

  try {
    const resource = resolveResource(schoolLevel);
    const rows = (await fetchNeis<Record<string, string>>(resource, {
      ATPT_OFCDC_SC_CODE: officeCode,
      SD_SCHUL_CODE: schoolCode,
      GRADE: grade,
      CLASS_NM: classNo,
      TI_FROM_YMD: fromYmd,
      TI_TO_YMD: toYmd,
    })) as Array<Record<string, string>>;

    const timetable: TimetableItem[] = rows.map((row) => ({
      date: normalizeYmd(row.ALL_TI_YMD || ""),
      grade: Number(row.GRADE || grade),
      classNo: Number(row.CLASS_NM || classNo),
      period: Number(row.PERIO || 0),
      subject: row.ITRT_CNTNT || "",
    }));

    timetable.sort((a, b) => a.date.localeCompare(b.date) || a.period - b.period);

    return NextResponse.json({ timetable });
  } catch (error) {
    if (error instanceof NeisError) {
      const status = error.code === "INFO-200" ? 200 : 502;
      return NextResponse.json({ message: mapNeisCodeMessage(error.code, error.message), code: error.code, timetable: [] }, { status });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "시간표를 조회하지 못했습니다." },
      { status: 500 },
    );
  }
}
