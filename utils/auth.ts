import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface CustomNextApiRequest extends NextApiRequest {
    userinfo?: { role?: string };
}

const prisma = new PrismaClient();

const saltRounds = Number(process.env.SALT_ROUNDS);
const jwtSecret = process.env.JWT_SECRET;

export const config = {
    api: {
        externalResolver: true,
    },
};

async function handler(req: CustomNextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;

    const numericId = Number(id);

    if (isNaN(numericId)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }

    try {
        const template = await prisma.comment.findUnique({
            where: {
                id: numericId,
            },
        });

        if (!template) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        return res.status(200).json(template);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export default function protectedRoute(req: CustomNextApiRequest, res: NextApiResponse) {
    return verifyTokenMiddleware(req, res, () => handler(req, res), 'admin');
}

export async function hashPassword(password: string): Promise<string> {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
        const match = await bcrypt.compare(password, hashedPassword);
        return match;
    } catch (error) {
        console.error('Error verifying password:', error);
        throw error;
    }
}

export async function generateToken(payload: object, expiresIn: string): Promise<string> {
    try {
        const token = jwt.sign(payload, jwtSecret as string, { expiresIn });
        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
}

type DecodedToken = {
    type: string;
    userId: number;
};

export async function verifyToken(token: string): Promise<DecodedToken | null> {
    try {
        const decoded = jwt.verify(token, jwtSecret as string) as DecodedToken;
        return decoded;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

export async function verifyTokenMiddleware(req: CustomNextApiRequest, res: NextApiResponse, next: () => void, requiredRole: string | null = null) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token missing' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret as string) as { role?: string };
        req.userinfo = decoded;

        if (requiredRole && decoded.role !== requiredRole) {
            return res.status(403).json({ error: 'Permission denied' });
        }

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
