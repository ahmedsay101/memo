import dbConnect from '../lib/mongodb'
import Admin from '../models/Admin'

// Script to create the initial admin user
// Run this once to set up the first admin account

const createInitialAdmin = async () => {
  try {
    await dbConnect()
    
    // Check if any admin exists
    const existingAdmin = await Admin.findOne({})
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists')
      return
    }

    // Create the initial admin user
    const admin = new Admin({
      username: 'admin',
      password: 'memo2024', // This will be hashed automatically
      role: 'super_admin'
    })

    await admin.save()
    console.log('✅ Initial admin user created successfully')
    console.log('Username:', admin.username)
    console.log('Role:', admin.role)
    console.log('⚠️  Please change the password after first login')
    
  } catch (error) {
    console.error('❌ Error creating initial admin:', error)
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createInitialAdmin()
}

export default createInitialAdmin