import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { text_id: string } }
) {
  const { text_id } = params;

  try {
    // Fetch all segments for the text, including their contents, ordered by sequence
    const segments = await prisma.segment.findMany({
      where: { text_id },
      orderBy: { sequence_number: 'asc' },
      include: {
        contents: true,
      },
    });

    if (!segments.length) {
      return NextResponse.json({ error: 'Text not found or has no segments' }, { status: 404 });
    }

    // Transform into a unified flat-ish JSON payload per your constraints
    // Resulting format:
    // [
    //   {
    //     segment_id: "ram:1.1.1",
    //     sequence_number: 1,
    //     root_san: "tapaH...",
    //     translation_en: "Ascetic..."
    //   }, ...
    // ]
    
    const result = segments.map((seg) => {
      // By using a flat payload, we fulfill constraint #3 (Flat Data over Nested Objects)
      const payload: Record<string, any> = {
        segment_id: seg.segment_id,
        sequence_number: seg.sequence_number,
      };

      // Map cognates dynamically based on content_type and language_code
      for (const content of seg.contents) {
        const key = `${content.content_type}_${content.language_code}`;
        payload[key] = content.text_content;
      }

      return payload;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching parallel text:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
