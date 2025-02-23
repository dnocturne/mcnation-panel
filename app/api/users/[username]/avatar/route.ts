import { NextResponse } from "next/server"
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'
import fs from "fs"
import path from "path"

export async function POST(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = await params

  try {
    const formData = await request.formData()
    const avatar = formData.get('avatar') as File
    
    if (!avatar) {
      return NextResponse.json(
        { error: "No avatar file provided" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public/avatars')
    await mkdir(uploadDir, { recursive: true })

    // Convert File to Buffer
    const bytes = await avatar.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file
    const filepath = join(uploadDir, `${username}.jpg`)
    await writeFile(filepath, buffer)

    return NextResponse.json({ 
      success: true,
      avatarUrl: `/avatars/${username}.jpg`
    })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const { username } = await params
  
  try {
    const avatarPath = path.join(process.cwd(), 'public', 'avatars', `${username}.jpg`)
    const hasCustomAvatar = fs.existsSync(avatarPath)
    
    return NextResponse.json({
      avatarUrl: hasCustomAvatar 
        ? `/avatars/${username}.jpg` 
        : `https://mc-heads.net/avatar/${username}`
    })
  } catch (error) {
    console.error('Error checking avatar:', error)
    return NextResponse.json({ 
      avatarUrl: `https://mc-heads.net/avatar/${username}` 
    })
  }
} 