import { NextResponse } from 'next/server'
import dbConnect from '../../../../lib/mongodb'
import Product from '../../../../models/Product'

export async function GET(request) {
  try {
    await dbConnect()
    
    // Build query to get all pizza products that can be used for half-selection
    const query = {
      category: 'pizza',
      productType: { $ne: 'half-half' }, // Exclude existing half-and-half products
      // Remove the available: true filter to get all pizzas, including temporarily unavailable ones
      // This allows for better half-pizza selection options
    }
    
    // Fetch pizzas using Mongoose model for consistency
    const pizzas = await Product.find(query)
      .select('_id name description price image available') // Select only needed fields
      .sort({ name: 1 }) // Sort alphabetically
      .lean()
    
    // Format for frontend
    const formattedPizzas = pizzas.map(pizza => ({
      id: pizza._id.toString(),
      name: pizza.name,
      description: pizza.description || '',
      price: pizza.price,
      image: pizza.image || '/images/default-pizza.jpg',
      available: pizza.available
    }))
    
    console.log(`🍕 Half-selection API: Found ${formattedPizzas.length} pizzas (including ${pizzas.filter(p => !p.available).length} unavailable)`)
    
    return NextResponse.json({
      success: true,
      pizzas: formattedPizzas,
      total: formattedPizzas.length,
      available: formattedPizzas.filter(p => p.available).length,
      unavailable: formattedPizzas.filter(p => !p.available).length
    })
    
  } catch (error) {
    console.error('Error fetching pizzas for half selection:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'خطأ في جلب بيانات البيتزا',
        pizzas: []
      },
      { status: 500 }
    )
  }
}