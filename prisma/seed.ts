import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.stationProgress.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.teacher.deleteMany();

  const teacherPass = await bcrypt.hash("klad2026", 10);

  const maria = await prisma.teacher.create({
    data: {
      name: "Мария Иванова",
      email: "maria.ivanova@klad.bg",
      passwordHash: teacherPass,
      classes: {
        create: [
          { grade: 5, parallel: "а" },
          { grade: 5, parallel: "в" },
        ],
      },
    },
    include: { classes: true },
  });

  const georgi = await prisma.teacher.create({
    data: {
      name: "Георги Петров",
      email: "georgi.petrov@klad.bg",
      passwordHash: teacherPass,
      classes: {
        create: [
          { grade: 5, parallel: "б" },
          { grade: 5, parallel: "г" },
        ],
      },
    },
    include: { classes: true },
  });

  const studentNames: Record<string, [string, string, string]> = {
    а: ["Ана Димитрова", "Борис Николов", "Виктория Стоянова"],
    б: ["Даниел Георгиев", "Елена Тодорова", "Ивайло Христов"],
    в: ["Калина Василева", "Мартин Колев", "Никол Ангелова"],
    г: ["Петър Михайлов", "Рая Стефанова", "Симеон Йорданов"],
  };

  const allClasses = [...maria.classes, ...georgi.classes];
  for (const cls of allClasses) {
    const names = studentNames[cls.parallel];
    for (let i = 0; i < 3; i++) {
      const number = i + 1;
      await prisma.student.create({
        data: {
          classGroupId: cls.id,
          classNumber: number,
          name: names[i],
          passwordHash: await bcrypt.hash(String(number), 10),
        },
      });
    }
  }

  console.log("Seeded teachers:", maria.email, georgi.email);
  console.log("Seeded 12 students (3 per parallel а/б/в/г). Password = class number.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
