import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo, TodoDocument } from './todo.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
  ) {}

  async create(createDto: CreateTodoDto, userId: string) {
    const todo = new this.todoModel({ ...createDto, createdBy: userId });
    await todo.save();
    return { message: 'Todo created successfully' };
  }

  // async findAll(userId: string, role: string) {
  //   if (role === 'admin') {
  //     return this.todoModel.find().exec();
  //   }

  //   return this.todoModel
  //     .find({
  //       $or: [{ createdBy: userId }, { assignedTo: userId }],
  //     })
  //     .exec();
  // }
  async findAll(
  userId: string,
  role: string,
  filters: { isCompleted?: string; isAssigned?: string },
) {
  const query: any = {};

  if (role !== 'admin') {
    query.$or = [{ createdBy: userId }, { assignedTo: userId }];
  }

  if (filters.isCompleted !== undefined) {
    query.isCompleted = filters.isCompleted === 'true';
  }

  if (filters.isAssigned !== undefined) {
    query.assignedTo =
      filters.isAssigned === 'true' ? { $ne: null } : null;
  }

  return this.todoModel
    .find(query)
    .populate('assignedTo completedBy', 'fullName email');
}


  async findOne(id: string, userId: string, role: string) {
    const todo = await this.todoModel.findById(id);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    if (
      role !== 'admin' &&
      todo.createdBy.toString() !== userId &&
      todo.assignedTo?.toString() !== userId
    ) {
      throw new NotFoundException('You do not have access to this todo');
    }

    return todo;
  }

  async delete(id: string, userId: string, role: string) {
    let filter = { _id: id };
    if (role !== 'admin') {
      filter['createdBy'] = userId;
    }

    const result = await this.todoModel.deleteOne(filter);
    if (result.deletedCount === 0) {
      throw new NotFoundException('Todo not found');
    }
    return { message: 'Todo deleted successfully' };
  }

  async update(
    id: string,
    userId: string,
    updateDto: UpdateTodoDto,
    role: string,
  ) {
    const todo = await this.todoModel.findById(id);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    if (
      role !== 'admin' &&
      todo.createdBy.toString() !== userId &&
      todo.assignedTo?.toString() !== userId
    ) {
      throw new NotFoundException('You do not have access to update this todo');
    }

    Object.assign(todo, updateDto);
    await todo.save();

    return { message: 'Todo updated successfully', todo };
  }

  async assignTodo(todoId: string, assignedToUserId: string) {
    const todo = await this.todoModel.findById(todoId);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    todo.assignedTo = new Types.ObjectId(assignedToUserId);
    await todo.save();

    return { message: 'Todo assigned successfully', todo };
  }
  async unassignTodo(todoId: string) {
    const todo = await this.todoModel.findById(todoId);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    todo.assignedTo = null;
    await todo.save();

    return { message: 'Todo unassigned successfully', todo };
  }
  async completeTodo(id: string, userId: string) {
    const todo = await this.todoModel.findById(id);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    if (todo.assignedTo?.toString() !== userId) {
      throw new ForbiddenException(
        'Only the assigned user can complete this todo',
      );
    }

    todo.isCompleted = true;
    todo.completedBy = userId;
    todo.assignedTo = null;
    await todo.save();

    return { message: 'Todo completed successfully', todo };
  }
}
