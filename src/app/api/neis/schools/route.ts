import { NextRequest, NextResponse } from "next/server";
import { fetchNeis } from "@/lib/neis";
import { mapNeisCodeMessage, NeisError } from "@/lib/neis-errors";
import { createSchoolKey } from "@/lib/school";
import { SchoolSummary } from "@/lib/types";

export async function GET(request: NextRequest) {
  const officeCode = request.nextUrl.searchParams.get("officeCode") || "";
  const schoolName = request.nextUrl.searchParams.get("schoolName") || "";
  const schoolCode = request.nextUrl.searchParams.get("schoolCode") || "";

  if (!officeCode) {
    return NextResponse.json({ message: "시도교육청 코드를 입력해 주세요." }, { status: 400 });
  }

  try {
    const rows = (await fetchNeis<Record<string, string>>("schoolInfo", {
      ATPT_OFCDC_SC_CODE: officeCode,
      SCHUL_NM: schoolName || undefined,
      SD_SCHUL_CODE: schoolCode || undefined,
    })) as Array<Record<string, string>>;

    const schools: SchoolSummary[] = rows.map((row) => ({
      schoolKey: createSchoolKey(row.ATPT_OFCDC_SC_CODE, row.SD_SCHUL_CODE),
      officeCode: row.ATPT_OFCDC_SC_CODE || "",
      officeName: row.ATPT_OFCDC_SC_NM || "",
      schoolCode: row.SD_SCHUL_CODE || "",
      schoolName: row.SCHUL_NM || "",
      schoolType: row.SCHUL_KND_SC_NM || "",
      orgType: row.FOND_SC_NM || "",
      regionName: row.LCTN_SC_NM || "",
      addressRoad: row.ORG_RDNMA || "",
      addressJibun: row.ORG_RDNDA || "",
      tel: row.ORG_TELNO || "",
      homepage: row.HMPG_ADRES || "",
      coeduType: row.COEDU_SC_NM || "",
    }));

    return NextResponse.json({ schools });
  } catch (error) {
    if (error instanceof NeisError) {
      const status = error.code === "INFO-200" ? 200 : 502;
      return NextResponse.json({ message: mapNeisCodeMessage(error.code, error.message), code: error.code, schools: [] }, { status });
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "학교 정보를 조회하지 못했습니다." },
      { status: 500 },
    );
  }
}
