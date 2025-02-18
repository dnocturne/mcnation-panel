import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://discord.com/api/guilds/962037670245179402/widget.json');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Discord API error:', error);
    return NextResponse.json({ presence_count: 0 }, { status: 500 });
  }
} 