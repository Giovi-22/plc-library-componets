import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LAYOUT_FILE = path.join(process.cwd(), 'scada-layout.json');

export async function GET() {
  try {
    const data = await fs.readFile(LAYOUT_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // Si el archivo no existe, devolvemos un layout vacío por defecto
    return NextResponse.json({ elements: [] });
  }
}

export async function POST(request: Request) {
  try {
    const layout = await request.json();
    await fs.writeFile(LAYOUT_FILE, JSON.stringify(layout, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al guardar el layout' }, { status: 500 });
  }
}
