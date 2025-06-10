import { Module, OnModuleInit } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TodosModule } from './todos/todos.module';
import { createDefaultAdmin } from './users/admin.seeder';
import { User, UserSchema } from './users/user.schema';
import { Model } from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/todos',
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    AuthModule,
    UsersModule,
    TodosModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async onModuleInit() {
    await createDefaultAdmin(this.userModel);
  }
}
