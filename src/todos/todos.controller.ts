import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Patch,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  async create(@Body() createDto: CreateTodoDto, @Req() req) {
    const userId = req.user.userId;
    await this.todosService.create(createDto, userId);
    return { message: 'Todo created successfully' };
  }
  // @Get()
  // async findAll(@Req() req) {
  //   console.log(req.user.userId, req.user.role);
  //   const userId = req.user.userId;
  //   const role = req.user.role;
  //   return this.todosService.findAll(userId, role);
  // }
  @Get()
  async findAll(
    @Req() req,
    @Query('isCompleted') isCompleted: string,
    @Query('isAssigned') isAssigned: string,
  ) {
    const userId = req.user.userId;
    const role = req.user.role;

    return this.todosService.findAll(userId, role, { isCompleted, isAssigned });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.todosService.findOne(id, req.user.userId, req.user.role);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.todosService.delete(id, req.user.userId, req.user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTodoDto, @Req() req) {
    return this.todosService.update(id, req.user.userId, body, req.user.role);
  }

  @Patch(':id/assign')
  assignTodo(
    @Param('id') todoId: string,
    @Body('assignedTo') assignedToUserId: string,
    @Req() req,
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can assign todos');
    }

    return this.todosService.assignTodo(todoId, assignedToUserId);
  }
  @Patch(':id/unassign')
  unassignTodo(@Param('id') todoId: string, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admin can unassign todos');
    }

    return this.todosService.unassignTodo(todoId);
  }
  @Post(':id/complete')
  async complete(@Param('id') id: string, @Req() req) {
    return this.todosService.completeTodo(id, req.user.userId);
  }
}
