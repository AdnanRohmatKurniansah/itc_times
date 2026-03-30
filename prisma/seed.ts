import 'dotenv/config'
import bcrypt from 'bcrypt'
import { prisma } from '../src/lib/prisma'

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  })

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        fullname: 'Adnan Pundong',
        email: 'superadmin@gmail.com',
        password: await bcrypt.hash('admin123#', 10),
        role: 'admin'
      }
    })
  }

  const kadiv = await prisma.user.upsert({
    where: { email: 'kadiv@gmail.com' },
    update: {},
    create: {
      fullname: 'Kadiv ITC',
      email: 'kadiv@gmail.com',
      password: await bcrypt.hash('kadiv123#', 10),
      role: 'kadiv'
    }
  })

  await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      fullname: 'User Demo',
      email: 'user@gmail.com',
      password: await bcrypt.hash('user123#', 10),
      role: 'user'
    }
  })

  const tagData = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Programming', slug: 'programming' },
    { name: 'Web Development', slug: 'web-development' },
    { name: 'Training', slug: 'training' },
    { name: 'Info Umum', slug: 'info-umum' }
  ]

  const tags: Record<string, string> = {}

  for (const tag of tagData) {
    const result = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: { name: tag.name, slug: tag.slug }
    })
    tags[tag.slug] = result.id
  }

  const announcementData = [
    {
      title: 'Pendaftaran ITC 2025 Dibuka',
      slug: 'pendaftaran-itc-2025-dibuka',
      content: 'Pendaftaran anggota baru ITC untuk tahun 2025 resmi dibuka. Segera daftarkan dirimu dan bergabung bersama kami!',
      imageUrl: 'https://placehold.co/800x400',
      authorId: kadiv.id,
      tagSlugs: ['info-umum', 'training']
    },
    {
      title: 'Workshop Web Development Batch 3',
      slug: 'workshop-web-development-batch-3',
      content: 'ITC mengadakan workshop Web Development Batch 3. Peserta akan belajar HTML, CSS, JavaScript, dan React dari dasar hingga mahir.',
      imageUrl: 'https://placehold.co/800x400',
      authorId: kadiv.id,
      tagSlugs: ['web-development', 'training']
    },
    {
      title: 'Pelatihan Python untuk Pemula',
      slug: 'pelatihan-python-untuk-pemula',
      content: 'ITC membuka pelatihan Python khusus pemula. Tidak diperlukan pengalaman programming sebelumnya.',
      imageUrl: null,
      authorId: kadiv.id,
      tagSlugs: ['programming', 'training']
    },
    {
      title: 'Seminar Teknologi AI di Era Modern',
      slug: 'seminar-teknologi-ai-di-era-modern',
      content: 'ITC mengadakan seminar bertema kecerdasan buatan dan dampaknya terhadap dunia teknologi modern.',
      imageUrl: 'https://placehold.co/800x400',
      authorId: kadiv.id,
      tagSlugs: ['technology', 'info-umum']
    },
    {
      title: 'Rapat Anggota ITC Semester Genap',
      slug: 'rapat-anggota-itc-semester-genap',
      content: 'Seluruh anggota ITC diwajibkan hadir pada rapat evaluasi dan perencanaan program kerja semester genap.',
      imageUrl: null,
      authorId: kadiv.id,
      tagSlugs: ['info-umum']
    }
  ]

  for (const { tagSlugs, ...data } of announcementData) {
    const existing = await prisma.announcement.findUnique({
      where: { slug: data.slug }
    })

    if (!existing) {
      await prisma.announcement.create({
        data: {
          ...data,
          announcementTags: {
            create: tagSlugs.map((slug) => ({ tagId: tags[slug] }))
          }
        }
      })
    }
  }

  console.log('Seeding completed successfully.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
