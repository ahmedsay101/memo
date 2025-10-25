import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import mongoose from 'mongoose'

export async function GET(request) {
  try {
    await dbConnect()
    
    // Use raw MongoDB query to avoid schema conflicts with category field
    const db = mongoose.connection.db
    const pizzasRaw = await db.collection('products').find({
      category: 'pizza', // Use string value as stored in database
      productType: { $ne: 'half-half' }, // Exclude half-and-half products
      available: true // Use 'available' field
    }).project({ 
      _id: 1, 
      name: 1, 
      description: 1, 
      price: 1, 
      image: 1 
    }).toArray()
    
    // Format for frontend
    const formattedPizzas = pizzasRaw.map(pizza => ({
      id: pizza._id.toString(),
      name: pizza.name,
      description: pizza.description,
      price: pizza.price,
      image: pizza.image
    }))
    
    console.log(`🍕 Half-selection API: Found ${formattedPizzas.length} pizzas`)
    
    return NextResponse.json({
      pizzas: formattedPizzas
    })
    
  } catch (error) {
    console.error('Error fetching pizzas for half selection:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب بيانات البيتزا' },
      { status: 500 }
    )
  }
}