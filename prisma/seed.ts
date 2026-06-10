import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// This script expects two flat JSON files mapping segment_id to text content
// Example: { "ram:1.1.1": "verse text..." }

async function main() {
  console.log('Starting seed...');

  // 1. Create the base Text metadata
  const textId = 'ram';
  await prisma.text.upsert({
    where: { text_id: textId },
    update: {},
    create: {
      text_id: textId,
      collection: 'epic',
      title_root: 'Rāmāyaṇa',
      title_en: 'Ramayana',
      root_language: 'san',
      base_encoding: 'slp1',
    },
  });

  // Load flat JSON data
  const rootFilePath = path.join(__dirname, 'root.json');
  const translationFilePath = path.join(__dirname, 'translation.json');

  if (!fs.existsSync(rootFilePath) || !fs.existsSync(translationFilePath)) {
    console.warn('⚠️ Missing root.json or translation.json in prisma folder.');
    console.warn('Please create them with format { "segment_id": "text" } to seed actual data.');
    return;
  }

  const rootData: Record<string, string> = JSON.parse(fs.readFileSync(rootFilePath, 'utf8'));
  const translationData: Record<string, string> = JSON.parse(fs.readFileSync(translationFilePath, 'utf8'));

  // Extract all unique segment IDs from both files
  const allSegmentIds = new Set([...Object.keys(rootData), ...Object.keys(translationData)]);
  const segmentIdsArray = Array.from(allSegmentIds).sort();

  let seqNum = 1;
  for (const segId of segmentIdsArray) {
    // 2. Create Segment structure
    await prisma.segment.upsert({
      where: { segment_id: segId },
      update: {},
      create: {
        segment_id: segId,
        text_id: textId,
        hierarchy_level: 2, // Defaulting to verse level for the seed
        sequence_number: seqNum++,
      },
    });

    // 3. Insert Root Cognate (if exists)
    if (rootData[segId]) {
      await prisma.segmentContent.upsert({
        where: {
          segment_id_content_type_language_code_author_uid: {
            segment_id: segId,
            content_type: 'root',
            language_code: 'san',
            author_uid: 'valmiki',
          },
        },
        update: {
          text_content: rootData[segId],
        },
        create: {
          segment_id: segId,
          content_type: 'root',
          language_code: 'san',
          author_uid: 'valmiki',
          text_content: rootData[segId],
        },
      });
    }

    // 4. Insert Translation Cognate (if exists)
    if (translationData[segId]) {
      await prisma.segmentContent.upsert({
        where: {
          segment_id_content_type_language_code_author_uid: {
            segment_id: segId,
            content_type: 'translation',
            language_code: 'en',
            author_uid: 'griffith',
          },
        },
        update: {
          text_content: translationData[segId],
        },
        create: {
          segment_id: segId,
          content_type: 'translation',
          language_code: 'en',
          author_uid: 'griffith',
          text_content: translationData[segId],
        },
      });
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
