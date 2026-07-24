import { NextResponse } from "next/server";
import { BOLIVIA_DEPARTMENTS } from "@/data/boliviaGeoJson";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deptId = searchParams.get("dept");

  if (deptId) {
    const dept = BOLIVIA_DEPARTMENTS.find((d) => d.id.toLowerCase() === deptId.toLowerCase());
    if (!dept) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    return NextResponse.json({
      status: "success",
      query: { deptId },
      data: dept,
      meta: {
        processedAt: new Date().toISOString(),
        engine: "GeoInsights Spatial Engine 1.0"
      }
    });
  }

  return NextResponse.json({
    status: "success",
    totalCount: BOLIVIA_DEPARTMENTS.length,
    departments: BOLIVIA_DEPARTMENTS.map(d => ({
      id: d.id,
      name: d.name,
      capital: d.capital,
      population: d.population,
      coordinates: d.coordinates,
      connectivityIndex: d.connectivityIndex,
      infrastructureScore: d.infrastructureScore
    })),
    meta: {
      provider: "GeoInsights Bolivia Platform",
      spatialFormat: "GeoJSON Standard"
    }
  });
}
