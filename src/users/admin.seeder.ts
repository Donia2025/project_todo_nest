import { User } from './user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

export const createDefaultAdmin = async (userModel: Model<User>) => {
  const existingAdmin = await userModel.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Donia123', 10);
    const admin = new userModel({
      fullName: 'Donia',
      email: 'Doniasaad@gmail.com',
      password: hashedPassword,
      role: 'admin',
    });
    await admin.save();
    console.log(' Default admin created');
  }
};
