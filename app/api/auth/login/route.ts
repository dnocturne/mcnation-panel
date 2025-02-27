import { getLibreLoginUser } from "@/lib/database/librelogin"
import { NextResponse } from "next/server"
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const user = await getLibreLoginUser(username)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    console.log('User data:', {
      algo: user.algo,
      hashedPassword: user.hashed_password,
      salt: user.salt
    })

    // The stored format is:
    // algo: BCrypt-2A
    // salt: stored separately
    // hashed_password: cost$hash
    const [cost, hash] = user.hashed_password.split('$')
    const bcryptHash = `$2a$${cost}$${user.salt}${hash}`
    
    console.log('BCrypt hash:', bcryptHash)
    
    // Verify password
    const isValid = await bcrypt.compare(password, bcryptHash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Log the username to verify it exists
    console.log('Creating token with username:', user.last_nickname)

    // Create JWT with username explicitly set as a claim
    const token = await new SignJWT({ 
      username: user.last_nickname,
      // Adding a unique subject helps ensure the claim isn't stripped
      sub: user.last_nickname 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .setIssuedAt()
      .sign(JWT_SECRET)
    
    // Log the token payload for debugging
    const [_header, payload] = token.split('.')
    const decodedPayload = Buffer.from(payload, 'base64').toString()
    console.log('Token payload:', decodedPayload)

    return NextResponse.json({ token, username: user.last_nickname })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 