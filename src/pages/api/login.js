import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, password } = JSON.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // Simple password check (for demo; use bcrypt in production!)
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password x' });
    }

    // TODO: Set a secure cookie/session here for production

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}