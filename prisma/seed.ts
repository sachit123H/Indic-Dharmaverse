import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed for DN 1...');

  // 1. Create the base Text metadata
  const textId = 'dn1';
  await prisma.text.upsert({
    where: { text_id: textId },
    update: {},
    create: {
      text_id: textId,
      collection: 'sutta',
      title_root: 'Brahmajāla Sutta',
      title_en: 'The Prime Net',
      root_language: 'pli',
      base_encoding: 'iast',
    },
  });

  const segments = [
    {
      segment_id: 'dn1:0.1',
      hierarchy_level: 1,
      root: 'Brahmajālasutta',
      translation: 'The Prime Net',
    },
    {
      segment_id: 'dn1:1.1.1',
      hierarchy_level: 2,
      root: 'evaṃ me sutaṃ—',
      translation: 'So I have heard.',
    },
    {
      segment_id: 'dn1:1.1.2',
      hierarchy_level: 2,
      root: 'ekaṃ samayaṃ bhagavā antarā ca rājagahaṃ antarā ca nāḷandaṃ addhānamaggappaṭipanno hoti mahatā bhikkhusaṅghena saddhiṃ pañcamattehi bhikkhusatehi.',
      translation: 'At one time the Buddha was traveling along the road between Rājagaha and Nālandā together with a large Saṅgha of five hundred monks.',
    },
    {
      segment_id: 'dn1:1.1.3',
      hierarchy_level: 2,
      root: 'suppiyopi kho paribbājako antarā ca rājagahaṃ antarā ca nāḷandaṃ addhānamaggappaṭipanno hoti saddhiṃ antevāsinā brahmadattena māṇavena.',
      translation: 'The wanderer Suppiya was also traveling along the road between Rājagaha and Nālandā together with his pupil, the student Brahmadatta.',
    }
  ];

  let seqNum = 1;
  for (const seg of segments) {
    // 2. Create Segment structure
    await prisma.segment.upsert({
      where: { segment_id: seg.segment_id },
      update: {},
      create: {
        segment_id: seg.segment_id,
        text_id: textId,
        hierarchy_level: seg.hierarchy_level,
        sequence_number: seqNum++,
      },
    });

    // 3. Insert Root Cognate
    await prisma.segmentContent.upsert({
      where: {
        segment_id_content_type_language_code_author_uid: {
          segment_id: seg.segment_id,
          content_type: 'root',
          language_code: 'pli',
          author_uid: 'ms',
        },
      },
      update: {
        text_content: seg.root,
      },
      create: {
        segment_id: seg.segment_id,
        content_type: 'root',
        language_code: 'pli',
        author_uid: 'ms',
        text_content: seg.root,
      },
    });

    // 4. Insert Translation Cognate
    await prisma.segmentContent.upsert({
      where: {
        segment_id_content_type_language_code_author_uid: {
          segment_id: seg.segment_id,
          content_type: 'translation',
          language_code: 'en',
          author_uid: 'sujato',
        },
      },
      update: {
        text_content: seg.translation,
      },
      create: {
        segment_id: seg.segment_id,
        content_type: 'translation',
        language_code: 'en',
        author_uid: 'sujato',
        text_content: seg.translation,
      },
    });
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