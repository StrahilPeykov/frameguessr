import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guess } = body

    // For now, just log the guess
    // In the future, you can save this to the database for authenticated users
    
    // Example: Get user from auth header (when auth is implemented)
    // const token = request.headers.get('authorization')?.replace('Bearer ', '')
    // const { data: { user } } = await supabase.auth.getUser(token)
    
    // if (user) {
    //   const today = format(new Date(), 'yyyy-MM-dd')
    //   await supabase.from('user_progress').upsert({
    //     user_id: user.id,
    //     date: today,
    //     attempts: /* increment */,
    //     completed: guess.correct,
    //     guesses: /* append guess */
    //   })
    // }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging guess:', error)
    return NextResponse.json(
      { error: 'Failed to log guess' },
      { status: 500 }
    )
  }
}